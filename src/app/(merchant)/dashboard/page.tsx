import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

  const { data: recentOrders } = await supabase.from("orders").select("id,customer_name,customer_phone,wilaya_name,confirmation_status,shipping_status,created_at,total_price").eq("merchant_id", merchantId).order("created_at", { ascending: false }).limit(5);

  return (
    <div className="space-y-6 animate-in">
      {/* KPI Cards — alive with gradients + icons */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden bg-card rounded-xl border border-border p-5 hover:shadow-sm hover:border-border-strong transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500" />
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 12h6M9 16h6M9 8h6M5 8h.01M5 12h.01M5 16h.01M9 20H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-2" /></svg>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">+12% ↑</span>
          </div>
          <div className="text-3xl font-black mt-3">{totalOrders ?? 0}</div>
          <div className="text-xs font-bold text-muted mt-1">إجمالي الطلبات</div>
          <div className="mt-3 h-1 bg-background rounded-full overflow-hidden"><div className="h-full w-[72%] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" /></div>
        </div>

        <div className="group relative overflow-hidden bg-card rounded-xl border border-border p-5 hover:shadow-sm hover:border-border-strong transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full">بانتظار</span>
          </div>
          <div className="text-3xl font-black mt-3 text-amber-600">{pending ?? 0}</div>
          <div className="text-xs font-bold text-muted mt-1">قيد الانتظار</div>
          <div className="mt-2 text-[11px] text-muted-soft">يحتاج تأكيد هاتفي</div>
        </div>

        <div className="group relative overflow-hidden bg-card rounded-xl border border-border p-5 hover:shadow-sm hover:border-border-strong transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full"> جاهز للشحن</span>
          </div>
          <div className="text-3xl font-black mt-3 text-emerald-600">{confirmed ?? 0}</div>
          <div className="text-xs font-bold text-muted mt-1">طلبات مؤكدة</div>
          <div className="mt-2 text-[11px] text-muted-soft">اضغط Yalidine للشحن</div>
        </div>

        <div className="group relative overflow-hidden bg-card rounded-xl border border-border p-5 hover:shadow-sm hover:border-border-strong transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-red-400 to-rose-500" />
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-3-3m-3-3l-3 3-3-3" /></svg>
            </div>
            <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded-full">محمي</span>
          </div>
          <div className="text-3xl font-black mt-3 text-red-600">{fake ?? 0}</div>
          <div className="text-xs font-bold text-muted mt-1">وهمي (تم حظره)</div>
          <div className="mt-2 text-[11px] text-muted-soft">كشف تلقائي</div>
        </div>
      </div>

      {/* Second row — Revenue hero + mini cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-primary text-white p-6 shadow-sm">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-500/20 to-red-500/20 rounded-full blur-2xl" />
          <div className="relative flex justify-between items-start">
            <div>
              <div className="text-xs font-bold tracking-widest opacity-60 uppercase">الإيراد المؤكد</div>
              <div className="text-4xl font-black mt-1">{revenue.toLocaleString("ar-DZ")} <span className="text-lg opacity-60">دج</span></div>
              <div className="text-xs opacity-60 mt-1">من الطلبات المؤكدة • تحديث لحظي</div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> مباشر
            </div>
          </div>
          {/* Mini chart bars */}
          <div className="mt-6 flex items-end gap-1.5 h-12">
            {[35, 55, 40, 70, 60, 85, 50, 75, 65, 90, 70, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-white/20 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[11px] opacity-50">
            <span>12 يوم مضت</span><span>اليوم</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
              </div>
              <div>
                <div className="font-black text-xl">{shipped ?? 0}</div>
                <div className="text-xs font-bold text-muted">تم الشحن</div>
              </div>
              <div className="ms-auto text-xs font-bold text-emerald-600">Yalidine • ZR</div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div>
                <div className="font-black text-xl">{productsCount ?? 0}</div>
                <div className="text-xs font-bold text-muted">منتجات نشطة</div>
              </div>
              <Link href="/dashboard/products" className="ms-auto text-xs bg-primary text-white px-3 py-1.5 rounded-full font-bold hover:opacity-90">إضافة →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders — alive table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center border-b border-border">
          <h2 className="font-black">آخر الطلبات</h2>
          <Link href="/dashboard/orders" className="text-xs font-bold bg-background border border-border px-3 py-1.5 rounded-full hover:bg-card-hover transition-colors">عرض الكل →</Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders && recentOrders.length ? recentOrders.map((o) => (
            <div key={o.id} className="px-6 py-4 flex items-center gap-4 hover:bg-card-hover/50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-white flex items-center justify-center font-black text-sm shrink-0 group-hover:scale-105 transition-transform">{o.customer_name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{o.customer_name} <span className="font-mono text-muted text-xs" dir="ltr">• {o.customer_phone}</span></div>
                <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                  <span className="bg-background border border-border px-2 py-0.5 rounded-full text-[11px] font-bold">{o.wilaya_name}</span>
                  <span>{new Date(o.created_at).toLocaleDateString("ar-DZ")}</span>
                  <span className="font-mono">• {o.total_price} دج</span>
                </div>
              </div>
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${o.confirmation_status === "fake" ? "bg-red-50 text-red-700 border-red-200" : o.confirmation_status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : o.confirmation_status === "double" ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${o.confirmation_status==="confirmed"?"bg-emerald-500":o.confirmation_status==="fake"?"bg-red-500":o.confirmation_status==="double"?"bg-orange-500":"bg-amber-500"}`} />
                {o.confirmation_status === "pending" ? "قيد الانتظار" : o.confirmation_status}
              </span>
              <Link href={`/dashboard/orders/${o.id}`} className="p-2 rounded-xl bg-background border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          )) : <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center mx-auto mb-3"></div>
            <p className="font-bold">لا توجد طلبات بعد</p>
            <p className="text-sm text-muted mt-1">شارك رابط منتجك وابدأ البيع!</p>
          </div>}
        </div>
      </div>
    </div>
  );
}
