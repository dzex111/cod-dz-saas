import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { WILAYAS } from "@/lib/data/wilayas";

// Rate Limit مجاني في الذاكرة (10 طلب/دقيقة لكل IP) — مع تنظيف تلقائي
const rateMap = new Map<string, { count: number; reset: number }>();
const MAX_RATE_ENTRIES = 10_000;
function checkRate(ip: string): boolean {
  const now = Date.now();
  // تنظيف كل دقيقة: احذف المنتهية
  if (rateMap.size > 0 && Math.random() < 0.01) {
    for (const [key, val] of rateMap) {
      if (now > val.reset) rateMap.delete(key);
    }
  }
  // حماية من الـ overflow
  if (rateMap.size > MAX_RATE_ENTRIES) rateMap.clear();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

const checkoutSchema = z.object({
  merchant_subdomain: z.string().min(2).max(50),
  product_slug: z.string().min(1).max(255),
  customer_name: z.string().min(2, "الاسم قصير").max(100),
  customer_phone: z.string().regex(/^(05|06|07)[0-9]{8}$/, "رقم هاتف جزائري غير صحيح"),
  wilaya_code: z.string().regex(/^(0[1-9]|[1-4][0-9]|5[0-8])$/, "كود ولاية غير صحيح"),
  wilaya_name: z.string().min(1),
  baladia_name: z.string().min(2, "البلدية مطلوبة").max(100),
  address: z.string().min(5, "العنوان قصير").max(500),
});

export async function POST(req: NextRequest) {
  // Rate Limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (!checkRate(ip)) {
    return NextResponse.json({ error: "عدد طلبات كبير — حاول بعد دقيقة" }, { status: 429 });
  }

  const supabaseAdmin = createAdminClient();
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON غير صالح" }, { status: 400 }); }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  // تحقق إضافي: كود الولاية يجب أن يطابق الاسم
  const wilaya = WILAYAS.find((w) => w.code === data.wilaya_code);
  if (!wilaya || wilaya.name !== data.wilaya_name) {
    // صحح تلقائياً إذا الاسم مختلف
    data.wilaya_name = wilaya?.name || data.wilaya_name;
  }
  const cleanPhone = data.customer_phone.replace(/[^0-9]/g, "");

  const { data: merchant } = await supabaseAdmin.from("merchants").select("id, subscription_status").eq("subdomain", data.merchant_subdomain).single();
  if (!merchant || merchant.subscription_status === "expired") {
    return NextResponse.json({ error: "المتجر غير متاح حالياً" }, { status: 403 });
  }

  const { data: product } = await supabaseAdmin.from("products").select("id, price, is_active").eq("merchant_id", merchant.id).eq("slug", data.product_slug).single();
  if (!product || !product.is_active) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  const { data: blacklisted } = await supabaseAdmin.from("blacklists").select("id").eq("merchant_id", merchant.id).eq("phone_number", cleanPhone).maybeSingle();
  const { data: recentOrder } = await supabaseAdmin.from("orders").select("id").eq("merchant_id", merchant.id).eq("customer_phone", cleanPhone).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).maybeSingle();

  const confirmationStatus = blacklisted ? "fake" : recentOrder ? "double" : "pending";

  const { data: order, error } = await supabaseAdmin.from("orders").insert({
    merchant_id: merchant.id,
    product_id: product.id,
    customer_name: data.customer_name,
    customer_phone: cleanPhone,
    wilaya_code: data.wilaya_code,
    wilaya_name: data.wilaya_name,
    baladia_name: data.baladia_name,
    address: data.address,
    total_price: product.price,
    confirmation_status: confirmationStatus,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: "فشل إنشاء الطلب: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, order_id: order.id, held: confirmationStatus !== "pending", status: confirmationStatus });
}
