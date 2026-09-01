import { createAdminClient } from "@/lib/supabase/server";

// ZR Express — شريك ثانٍ مجاني للمنصة (حساب كل تاجر منفصل، نفس مبدأ Yalidine)
// التوثيق: https://zr-express.com/api — نستخدم نفس بنية Yalidine مع اختلاف بسيط في الهيدر/الحقول
// إذا اختلف التوثيق الفعلي، عدّل الحقول هنا فقط — بقية الكود موحد

const ZR_BASE_URL = process.env.ZR_EXPRESS_BASE_URL || "https://api.zr-express.com/api/v1";

export async function createZRExpressShipment(orderId: string) {
  const supabaseAdmin = createAdminClient();

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*, products(name)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) throw new Error("الطلب غير موجود");

  const { data: config } = await supabaseAdmin
    .from("shipping_configs")
    .select("*")
    .eq("merchant_id", order.merchant_id)
    .eq("provider_name", "zr_express")
    .eq("is_active", true)
    .single();

  if (!config) throw new Error("لم يقم التاجر بربط حساب ZR Express بعد");

  // ZR يتوقع نفس الحقول تقريباً — مع is_stopdesk / to_wilaya_name
  const payload = {
    order_id: `ORD-${order.id.slice(0, 8)}`,
    client_name: order.customer_name,
    phone: order.customer_phone,
    address: order.address,
    wilaya: order.wilaya_name,
    commune: order.baladia_name,
    product: (order.products as { name: string } | null)?.name || "منتج",
    price: Math.round(Number(order.total_price)),
    // حقول إضافية اختيارية
    is_stopdesk: false,
  };

  const response = await fetch(`${ZR_BASE_URL}/create/colis`, {
    method: "POST",
    headers: {
      "X-API-KEY": config.api_token, // ZR يستخدم مفتاح واحد غالباً
      "X-API-ID": config.api_id,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`فشل الاتصال بـ ZR Express: ${err}`);
  }

  const result = await response.json() as { success?: boolean; tracking?: string; label?: string; error?: string; data?: { tracking?: string } };
  if (result.success === false) throw new Error(result.error || "ZR Express رفض الطلب");

  const tracking = result.tracking || result.data?.tracking || `ZR-${order.id.slice(0, 8)}`;
  const label = result.label || "";

  await supabaseAdmin
    .from("orders")
    .update({
      shipping_status: "shipped",
      tracking_number: tracking,
      waybill_pdf_url: label || null,
      shipping_provider: "zr_express",
    })
    .eq("id", orderId);

  return { tracking, label };
}
