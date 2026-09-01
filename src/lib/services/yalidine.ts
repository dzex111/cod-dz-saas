import { createAdminClient } from "@/lib/supabase/server";

const YALIDINE_BASE_URL = "https://api.yalidine.app/v1";

export async function createYalidineShipment(orderId: string) {
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
    .eq("provider_name", "yalidine")
    .eq("is_active", true)
    .single();

  if (!config) {
    throw new Error("لم يقم التاجر بربط حساب Yalidine بعد");
  }

  const payload = [
    {
      order_id: `ORD-${order.id.slice(0, 8)}`,
      firstname: order.customer_name,
      familyname: "",
      contact_phone: order.customer_phone,
      address: order.address,
      to_wilaya_name: order.wilaya_name,
      to_commune_name: order.baladia_name,
      product_list: (order.products as { name: string } | null)?.name || "منتج",
      price: Math.round(Number(order.total_price)),
      is_stopdesk: false,
      freeshipping: false,
      has_exchange: 0,
      product_to_collect: 0,
    },
  ];

  const response = await fetch(`${YALIDINE_BASE_URL}/parcels`, {
    method: "POST",
    headers: {
      "X-API-ID": config.api_id,
      "X-API-TOKEN": config.api_token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`فشل الاتصال بـ Yalidine: ${errorBody}`);
  }

  const result = await response.json();
  // Yalidine returns object keyed by order_id
  const key = `ORD-${order.id.slice(0, 8)}`;
  const parcelInfo = result[key] ?? Object.values(result)[0] as { success?: boolean; tracking?: string; label?: string; error?: string } | undefined;

  if (!parcelInfo || (parcelInfo as { success?: boolean }).success === false) {
    const msg = (parcelInfo as { error?: string })?.error ?? "Yalidine رفضت الطلب — تحقق من صحة البيانات";
    throw new Error(msg);
  }

  const tracking = (parcelInfo as { tracking: string }).tracking;
  const label = (parcelInfo as { label: string }).label;

  await supabaseAdmin
    .from("orders")
    .update({
      shipping_status: "shipped",
      tracking_number: tracking,
      waybill_pdf_url: label,
      shipping_provider: "yalidine",
    })
    .eq("id", orderId);

  return { tracking, label };
}
