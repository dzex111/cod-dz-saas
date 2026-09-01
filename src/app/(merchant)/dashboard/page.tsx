import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
  const merchantId = membership!.merchant_id;

  const [{ count: totalOrders }, { count: pending }, { count: confirmed }, { count: fake }, { count: shipped }, { count: productsCount }, { data: revenueData }] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("merchant_id", merchantId),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("merchant_id", merchantId).eq("confirmation_status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("merchant_id", merchantId).eq("confirmation_status", "confirmed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("merchant_id", merchantId).eq("confirmation_status", "fake"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("merchant_id", merchantId).eq("shipping_status", "shipped"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("merchant_id", merchantId),
    supabase.from("orders").select("total_price").eq("merchant_id", merchantId).eq("confirmation_status", "confirmed"),
  ]);
  const revenue = revenueData?.reduce((s, r) => s + Number(r.total_price), 0) || 0;

  const { data: recentOrders } = await supabase.from("orders").select("id,customer_name,customer_phone,wilaya_name,confirmation_status,shipping_status,created_at").eq("merchant_id", merchantId).order("created_at", { ascending: false }).limit(5);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm"><div className="text-sm font-bold text-zinc-600">إجمالي الطلبات</div><div className="text-3xl font-black mt-2 text-zinc-900">{totalOrders ?? 0}</div></div>
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm"><div className="text-sm font-bold text-zinc-600">قيد الانتظار</div><div className="text-3xl font-black mt-2 text-amber-600">{pending ?? 0}</div></div>
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm"><div className="text-sm font-bold text-zinc-600">مؤكد</div><div className="text-3xl font-black mt-2 text-emerald-600">{confirmed ?? 0}</div></div>
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm"><div className="text-sm font-bold text-zinc-600">وهمي</div><div className="text-3xl font-black mt-2 text-red-600">{fake ?? 0}</div></div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-sm"><div className="text-sm font-bold text-zinc-300">الإيراد المؤكد</div><div className="text-3xl font-black mt-2">{revenue.toLocaleString("ar-DZ")} دج</div><div className="text-xs font-medium text-zinc-400 mt-2">من الطلبات المؤكدة — مجاني</div></div>
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm"><div className="text-sm font-bold text-zinc-600">تم الشحن</div><div className="text-3xl font-black mt-2 text-zinc-900">{shipped ?? 0}</div></div>
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm"><div className="text-sm font-bold text-zinc-600">المنتجات</div><div className="text-3xl font-black mt-2 text-zinc-900">{productsCount ?? 0}</div></div>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-5 py-4 font-bold border-b">آخر الطلبات</div>
        <div className="divide-y">
          {recentOrders && recentOrders.length ? recentOrders.map((o) => (
            <div key={o.id} className="px-5 py-3 flex justify-between items-center text-sm">
              <div><div className="font-medium">{o.customer_name} — {o.customer_phone}</div><div className="text-xs text-zinc-500">{o.wilaya_name} • {new Date(o.created_at).toLocaleDateString("ar-DZ")}</div></div>
              <span className={`px-2 py-1 rounded-full text-xs ${o.confirmation_status==="fake"?"bg-red-100 text-red-700":o.confirmation_status==="double"?"bg-orange-100 text-orange-700":o.confirmation_status==="confirmed"?"bg-emerald-100 text-emerald-700":"bg-zinc-100"}`}>{o.confirmation_status}</span>
            </div>
          )) : <div className="p-8 text-center text-zinc-500 text-sm">لا توجد طلبات بعد — شارك رابط منتجك وابدأ البيع!</div>}
        </div>
      </div>
    </div>
  );
}
