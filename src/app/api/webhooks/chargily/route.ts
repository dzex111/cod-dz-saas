import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("signature") || "";
  const rawBody = await req.text();

  const secret = process.env.CHARGILY_SECRET_KEY || "";
  if (!secret) return NextResponse.json({ error: "CHARGILY_SECRET_KEY missing" }, { status: 500 });

  // حماية حرجة: لا تسمح بالمرور بدون توقيع
  if (!signature) {
    return NextResponse.json({ error: "توقيع مفقود" }, { status: 400 });
  }

  const computedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "utf8");
    const compBuf = Buffer.from(computedSignature, "utf8");
    if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
      return NextResponse.json({ error: "توقيع غير صالح" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "توقيع غير صالح" }, { status: 400 });
  }

  // منع تكرار المعالجة (idempotency) — تحقق إذا المعاملة موجودة مسبقاً
  const supabaseAdminIdem = createAdminClient();
  const eventTmp = JSON.parse(rawBody) as { data?: { id?: string } };
  if (eventTmp?.data?.id) {
    const { data: existing } = await supabaseAdminIdem.from("subscription_payments").select("id").eq("transaction_reference", eventTmp.data.id).maybeSingle();
    if (existing) return NextResponse.json({ received: true, duplicate: true });
  }

  let event: { type: string; data: { id: string; amount: number; metadata?: { merchant_id?: string; duration_months?: string } } };
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "JSON invalid" }, { status: 400 }); }

  if (event.type === "checkout.paid" || event.type === "payment.succeeded") {
    const merchant_id = event.data.metadata?.merchant_id;
    const duration_months = event.data.metadata?.duration_months || "1";
    const amount = event.data.amount;
    if (!merchant_id) return NextResponse.json({ error: "merchant_id missing in metadata" }, { status: 400 });

    const supabaseAdmin = createAdminClient();
    const { data: merchant } = await supabaseAdmin.from("merchants").select("subscription_ends_at").eq("id", merchant_id).single();
    const currentEnd = merchant?.subscription_ends_at && new Date(merchant.subscription_ends_at) > new Date() ? new Date(merchant.subscription_ends_at) : new Date();
    currentEnd.setMonth(currentEnd.getMonth() + Number(duration_months || 1));

    await supabaseAdmin.from("merchants").update({ subscription_status: "active", subscription_ends_at: currentEnd.toISOString() }).eq("id", merchant_id);
    await supabaseAdmin.from("subscription_payments").insert({
      merchant_id,
      payment_method: "chargily",
      transaction_reference: event.data.id,
      amount,
      status: "approved",
      approved_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
