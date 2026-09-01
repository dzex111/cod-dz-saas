import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminSubsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "kinezedge@gmail.com").split(",").map(s => s.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">غير مصرح</h1>
          <p className="text-gray-600 mt-2">هذه اللوحة للأدمن فقط</p>
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          <Link href="/" className="inline-block mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const admin = createAdminClient();

  // جلب الإحصائيات
  const [
    { count: totalMerchants },
    { count: totalOrders },
    { count: pendingPayments },
    { count: totalProducts },
    { data: recentMerchants },
    { data: pendingPays },
  ] = await Promise.all([
    admin.from("merchants").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("subscription_payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("merchants").select("id, business_name, subdomain, subscription_status, created_at, phone").order("created_at", { ascending: false }).limit(10),
    admin.from("subscription_payments").select("*, merchants(business_name, subdomain)").eq("payment_method", "baridimob").eq("status", "pending").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">COD DZ</span>
                <span className="text-xs text-gray-400 block -mt-0.5">Admin Panel</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition">لوحة التحكم</Link>
            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
              {user.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-500 mt-1">مرحباً بك، {user.email} — إدارة شاملة للمنصة</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">إجمالي التجار</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalMerchants ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">دفعات معلقة</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pendingPayments ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalProducts ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Merchants Table - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">آخر التجار المسجلين</h2>
              <span className="text-sm text-gray-500">{totalMerchants ?? 0} تاجر</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">المتجر</th>
                    <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">النطاق</th>
                    <th className="px-6 py-3 text-center font-semibold text-xs uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-center font-semibold text-xs uppercase tracking-wider">الهاتف</th>
                    <th className="px-6 py-3 text-center font-semibold text-xs uppercase tracking-wider">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentMerchants && recentMerchants.length > 0 ? recentMerchants.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{m.business_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 font-mono text-xs" dir="ltr">{m.subdomain}.coddz.com</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          m.subscription_status === "active" ? "bg-emerald-50 text-emerald-700" :
                          m.subscription_status === "trial" ? "bg-blue-50 text-blue-700" :
                          m.subscription_status === "expired" ? "bg-red-50 text-red-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {m.subscription_status === "active" ? "نشط" :
                           m.subscription_status === "trial" ? "تجريبي" :
                           m.subscription_status === "expired" ? "منتهي" : m.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-500 font-mono text-xs" dir="ltr">{m.phone || "—"}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-500 text-xs">{new Date(m.created_at).toLocaleDateString("ar-DZ")}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="font-medium">لا يوجد تجار بعد</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Payments - 1 column */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">دفعات BaridiMob المعلقة</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingPays && pendingPays.length > 0 ? pendingPays.map((p) => (
                <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm">{(p.merchants as { business_name?: string } | null)?.business_name || "—"}</span>
                    <span className="font-bold text-gray-900">{p.amount} دج</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span dir="ltr" className="font-mono">{p.transaction_reference}</span>
                    <span>{new Date(p.created_at).toLocaleDateString("ar-DZ")}</span>
                  </div>
                  {p.proof_image_path && (
                    <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/baridimob-proofs/${p.proof_image_path}`} target="_blank" className="text-blue-600 hover:text-blue-700 text-xs font-medium underline">عرض الإيصال</a>
                  )}
                  <div className="flex gap-2 mt-3">
                    <form action={approveAction.bind(null, p.id, p.merchant_id, true)} className="flex-1">
                      <button className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition">موافقة</button>
                    </form>
                    <form action={approveAction.bind(null, p.id, p.merchant_id, false)} className="flex-1">
                      <button className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition">رفض</button>
                    </form>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-12 text-center">
                  <div className="text-gray-400">
                    <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="font-medium text-sm">لا توجد دفعات معلقة</p>
                    <p className="text-xs text-gray-400 mt-1">ستظهر هنا طلبات الدفع الجديدة</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/orders" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-gray-900">إدارة الطلبات</div>
                <div className="text-xs text-gray-500">عرض وتأكيد الطلبات</div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/products" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-gray-900">المنتجات</div>
                <div className="text-xs text-gray-500">إضافة وتعديل المنتجات</div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/blacklists" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-gray-900">القائمة السوداء</div>
                <div className="text-xs text-gray-500">إدارة الأرقام المحظورة</div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

async function approveAction(paymentId: string, merchantId: string, approve: boolean) {
  "use server";
  const admin = createAdminClient();
  if (approve) {
    await admin.from("subscription_payments").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", paymentId);
    const { data: m } = await admin.from("merchants").select("subscription_ends_at").eq("id", merchantId).single();
    const base = m?.subscription_ends_at && new Date(m.subscription_ends_at) > new Date() ? new Date(m.subscription_ends_at) : new Date();
    base.setMonth(base.getMonth() + 1);
    await admin.from("merchants").update({ subscription_status: "active", subscription_ends_at: base.toISOString() }).eq("id", merchantId);
  } else {
    await admin.from("subscription_payments").update({ status: "rejected" }).eq("id", paymentId);
  }
  redirect("/admin/subscriptions");
}
