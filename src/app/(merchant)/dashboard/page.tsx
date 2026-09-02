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
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm"><div className="text-sm font-bold text-muted-soft">إجمالي الطلبات</div><div className="text-3xl font-extrabold text-foreground mt-2">{totalOrders ?? 0}</div></div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm"><div className="text-sm font-bold text-muted-soft">قيد الانتظار</div><div className="text-3xl font-extrabold text-foreground mt-2">{pending ?? 0}</div></div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm"><div className="text-sm font-bold text-muted-soft">مؤكد</div><div className="text-3xl font-extrabold text-foreground mt-2">{confirmed ?? 0}</div></div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm"><div className="text-sm font-bold text-muted-soft">وهمي</div><div className="text-3xl font-extrabold text-foreground mt-2">{fake ?? 0}</div></div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm"><div className="text-sm font-bold text-muted-soft">الإيراد المؤكد</div><div className="text-3xl font-extrabold text-foreground mt-2">{revenue.toLocaleString("ar-DZ")} دج</div><div className="text-xs font-medium text-muted-soft mt-2">من الطلبات المؤكدة — مجاني</div></div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm"><div className="text-sm font-bold text-muted-soft">تم الشحن</div><div className="text-3xl font-extrabold text-foreground mt-2">{shipped ?? 0}</div></div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm"><div className="text-sm font-bold text-muted-soft">المنتجات</div><div className="text-3xl font-extrabold text-foreground mt-2">{productsCount ?? 0}</div></div>
      </div>
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 font-bold border-b border-border">آخر الطلبات</div>
        <div className="divide-y">
          {recentOrders && recentOrders.length ? recentOrders.map((o) => (
            <div key={o.id} className="px-6 py-3 flex justify-between items-center text-sm">
              <div><div className="font-medium">{o.customer_name} — {o.customer_phone}</div><div className="text-xs text-muted-soft">{o.wilaya_name} • {new Date(o.created_at).toLocaleDateString("ar-DZ")}</div></div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.confirmation_status === "fake" ? "bg-red-100 text-red-700" : o.confirmation_status === "double" ? "bg-orange-100 text-orange-700" : o.confirmation_status === "confirmed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{o.confirmation_status}</span>
            </div>
          )) : <div className="p-8 text-center text-muted-soft text-sm">لا توجد طلبات بعد — شارك رابط منتجك وابدأ البيع!</div>}
        </div>
      </div>
    </div>
  );
}