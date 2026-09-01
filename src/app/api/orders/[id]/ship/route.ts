import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createShipment } from "@/lib/services/shipping";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  // verify ownership via merchant_members
  const { data: membership } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "لا يوجد متجر" }, { status: 403 });

  const { data: order } = await supabase.from("orders").select("merchant_id, confirmation_status, shipping_status").eq("id", id).single();
  if (!order || order.merchant_id !== membership.merchant_id) return NextResponse.json({ error: "الطلب غير موجود أو ليس لك" }, { status: 404 });

  // حماية لوجستية: لا تشحن الوهمي/المكرر إلا بعد التأكيد
  if (order.confirmation_status !== "confirmed") {
    return NextResponse.json({ error: "يجب تأكيد الطلب أولاً قبل الشحن (حالياً: " + order.confirmation_status + ")" }, { status: 400 });
  }
  if (order.shipping_status === "shipped") {
    return NextResponse.json({ error: "الطلب مشحون مسبقاً" }, { status: 400 });
  }

  // اختيار المزود من body أو تلقائي
  let provider: string | undefined;
  try { const body = await _req.json().catch(()=>null); provider = body?.provider; } catch {}
  try {
    const result = await createShipment(id, provider);
    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "فشل الشحن";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
