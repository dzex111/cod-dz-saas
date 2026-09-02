import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createChargilyCheckout } from "@/lib/services/chargily";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { data: membership } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "لا يوجد متجر" }, { status: 403 });

  let body: { plan?: string; months?: number };
  try { body = await req.json(); } catch { body = {}; }
  const months = body.months && [1,3,6,12].includes(body.months) ? body.months : 1;
  // تسعير مجاني 100% حالياً — لكن نترك منطق المبلغ جاهزاً للأتمتة (0 أو placeholder)
  // المنصة مجانية، لكن Chargily يحتاج amount >0 — نستخدم 100 دج رمزي قابل للاسترداد أو 0 عبر BaridiMob
  // هنا نجعل المبلغ 0 يعني مجاني — لكن Chargily يرفض 0، لذا نستخدم BaridiMob كتفضيلي
  // للتجربة: نستخدم 500 دج للشهر كمبلغ تجريبي (يمكن جعله 0 لاحقاً)
  const amountMap: Record<number, number> = { 1: 500, 3: 1200, 6: 2000, 12: 3500 };
  const amount = amountMap[months] ?? 500;

  const origin = req.headers.get("origin") || req.headers.get("host") ? `https://${req.headers.get("host")}` : `https://${process.env.NEXT_PUBLIC_BASE_DOMAIN || "ordely.com"}`;

  try {
    const checkout = await createChargilyCheckout({
      merchant_id: membership.merchant_id,
      amount,
      description: `اشتراك ORDELY - ${months} شهر`,
      success_url: `${origin}/dashboard/settings/billing?chargily=success`,
      failure_url: `${origin}/dashboard/settings/billing?chargily=cancel`,
      webhook_endpoint: `${origin}/api/webhooks/chargily`,
      metadata: { merchant_id: membership.merchant_id, duration_months: String(months) },
    });
    // Chargily يرجع { checkout_url } أو { url }
    const url = (checkout as { checkout_url?: string; url?: string }).checkout_url || (checkout as { url?: string }).url;
    if (!url) return NextResponse.json({ error: "Chargily لم يرجع رابط دفع", raw: checkout }, { status: 500 });
    return NextResponse.json({ url, checkout });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "فشل إنشاء جلسة Chargily";
    // إذا كان CHARGILY_API_KEY placeholder، نوجه لـ BaridiMob
    if (msg.includes("CHARGILY_API_KEY")) {
      return NextResponse.json({ error: "Chargily غير مفعّل — استخدم BaridiMob المجاني 0% حالياً", fallback: "baridimob" }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
