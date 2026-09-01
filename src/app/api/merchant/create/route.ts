import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let body: { business_name?: string; subdomain?: string; phone?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON غير صالح" }, { status: 400 }); }

  const business_name = body.business_name?.trim();
  const subdomain = body.subdomain?.trim().toLowerCase();
  const phone = body.phone?.replace(/[^0-9]/g, "");
  const userId = user?.id;

  if (!business_name || business_name.length < 2) return NextResponse.json({ error: "اسم النشاط قصير" }, { status: 400 });
  if (!subdomain || !/^[a-z0-9-]{3,30}$/.test(subdomain)) return NextResponse.json({ error: "النطاق الفرعي غير صالح" }, { status: 400 });
  if (!phone || !/^(05|06|07)[0-9]{8}$/.test(phone)) return NextResponse.json({ error: "رقم هاتف غير صحيح" }, { status: 400 });
  if (!userId) return NextResponse.json({ error: "غير مصرح — سجل الدخول أولاً" }, { status: 401 });

  const admin = createAdminClient();

  // تحقق النطاق محجوز؟
  const { data: existing } = await admin.from("merchants").select("id").eq("subdomain", subdomain).maybeSingle();
  if (existing) return NextResponse.json({ error: "النطاق الفرعي محجوز — اختر آخر" }, { status: 409 });

  // إنشاء المتجر عبر service_role (يتجاوز RLS — مجاني وآمن)
  const { data: merchant, error: mErr } = await admin.from("merchants").insert({
    owner_user_id: userId,
    business_name,
    subdomain,
    phone,
    subscription_status: "active",
    subscription_ends_at: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString(),
    trial_ends_at: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString(),
  }).select("id").single();

  if (mErr) return NextResponse.json({ error: "فشل إنشاء المتجر: " + mErr.message }, { status: 500 });

  const { error: memErr } = await admin.from("merchant_members").insert({
    merchant_id: merchant.id,
    user_id: userId,
    role: "admin",
  });

  if (memErr) {
    // تنظيف المتجر اليتيم
    await admin.from("merchants").delete().eq("id", merchant.id);
    return NextResponse.json({ error: "فشل ربط العضوية: " + memErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, merchant_id: merchant.id });
}
