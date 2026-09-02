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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card rounded-xl shadow-sm border border-border p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">غير مصرح</h1>
          <p className="text-muted mt-2">هذه اللوحة للأدمن فقط</p>
          <p className="text-sm text-muted-soft mt-1">{user.email}</p>
          <Link href="/" className="inline-block mt-6 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const admin = createAdminClient();

  const [
    { count: totalMerchants },
    { count: totalOrders },
    { count: pendingPayments },
    { count: totalProducts },
    { data: recentMerchants },
    { data: pendingPays },
    { data: allMerchants },
  ] = await Promise.all([
    admin.from("merchants").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("subscription_payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("merchants").select("id, business_name, subdomain, subscription_status, created_at, phone").order("created_at", { ascending: false }).limit(10),
    admin.from("subscription_payments").select("*, merchants(business_name, subdomain)").eq("payment_method", "baridimob").eq("status", "pending").order("created_at", { ascending: false }),
    admin.from("merchants").select("id, business_name, subdomain, subscription_status, phone, created_at, subscription_ends_at").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold">O</div>
            <span className="font-bold">ORDELY</span>
            <span className="text-xs text-muted border border-border px-2 py-0.5 rounded">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted hover:text-ink">Dashboard</Link>
            <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-sm font-bold">{user.email?.[0]?.toUpperCase()}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin — Control Center</h1>
          <p className="text-sm text-muted mt-1">مرحباً {user.email} — إدارة شاملة، صلاحيات كاملة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-muted">Total merchants</div>
            <div className="text-2xl font-bold mt-1">{totalMerchants ?? 0}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-muted">Total orders</div>
            <div className="text-2xl font-bold mt-1">{totalOrders ?? 0}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-muted">Pending payments</div>
            <div className="text-2xl font-bold mt-1">{pendingPayments ?? 0}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-muted">Products</div>
            <div className="text-2xl font-bold mt-1">{totalProducts ?? 0}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="font-semibold">All merchants — full control</h2>
            <span className="text-xs text-muted">{allMerchants?.length ?? 0} stores</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-subtle border-b border-border text-muted">
                <tr className="text-xs">
                  <th className="px-4 py-2.5 text-right">Store</th>
                  <th className="px-4 py-2.5 text-left">Subdomain</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-center">Phone</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allMerchants?.map((m) => (
                  <tr key={m.id} className="hover:bg-subtle/50">
                    <td className="px-4 py-3 font-medium">{m.business_name}</td>
                    <td className="px-4 py-3 font-mono text-xs" dir="ltr">{m.subdomain}.{process.env.NEXT_PUBLIC_BASE_DOMAIN || "ordely.com"}</td>
                    <td className="px-4 py-3 text-center"><span className={`text-xs border px-2 py-1 rounded-full font-medium ${m.subscription_status === "suspended" ? "bg-danger/10 text-danger border-danger/20" : m.subscription_status === "active" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>{m.subscription_status}</span></td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{m.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end flex-wrap">
                        <a href={`https://${process.env.NEXT_PUBLIC_BASE_DOMAIN || "ordely.com"}/${m.subdomain}`} target="_blank" className="text-xs border border-border rounded-lg px-2 py-1 hover:bg-subtle">View</a>
                        <form action={toggleSuspend.bind(null, m.id, m.subscription_status)} className="inline">
                          <button className={`text-xs rounded-lg px-2 py-1 border ${m.subscription_status === "suspended" ? "bg-success text-white border-success" : "bg-warning text-white border-warning"}`}>{m.subscription_status === "suspended" ? "Activate" : "Suspend"}</button>
                        </form>
                        <form action={deleteMerchant.bind(null, m.id)} className="inline">
                          <button className="text-xs bg-danger text-white rounded-lg px-2 py-1 hover:bg-danger/90">Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="font-semibold">Recent merchants</h2>
              <span className="text-xs text-muted">{totalMerchants ?? 0} total</span>
            </div>
            <div className="divide-y divide-border">
              {recentMerchants?.map((m) => (
                <div key={m.id} className="px-6 py-3 flex justify-between items-center hover:bg-subtle/50">
                  <div>
                    <div className="font-medium text-sm">{m.business_name}</div>
                    <div className="text-xs text-muted font-mono" dir="ltr">{m.subdomain}</div>
                  </div>
                  <span className="text-xs border border-border rounded-full px-2 py-1 bg-subtle">{m.subscription_status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold">Pending BaridiMob</h2>
            </div>
            <div className="divide-y divide-border">
              {pendingPays && pendingPays.length > 0 ? pendingPays.map((p) => (
                <div key={p.id} className="px-6 py-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">{(p.merchants as { business_name?: string } | null)?.business_name || "—"}</span>
                    <span className="font-bold text-sm">{p.amount} DZD</span>
                  </div>
                  <div className="text-xs text-muted font-mono" dir="ltr">{p.transaction_reference}</div>
                  {p.proof_image_path && <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/baridimob-proofs/${p.proof_image_path}`} target="_blank" className="text-xs text-primary underline">View receipt</a>}
                  <div className="flex gap-2 mt-3">
                    <form action={approveAction.bind(null, p.id, p.merchant_id, true)} className="flex-1"><button className="w-full bg-success text-white rounded-lg py-2 text-xs font-medium">Approve</button></form>
                    <form action={approveAction.bind(null, p.id, p.merchant_id, false)} className="flex-1"><button className="w-full border border-border rounded-lg py-2 text-xs">Reject</button></form>
                  </div>
                </div>
              )) : <div className="p-10 text-center text-sm text-muted">No pending payments</div>}
            </div>
          </div>
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

async function toggleSuspend(merchantId: string, currentStatus: string) {
  "use server";
  const admin = createAdminClient();
  const newStatus = currentStatus === "suspended" ? "active" : "suspended";
  await admin.from("merchants").update({ subscription_status: newStatus }).eq("id", merchantId);
  redirect("/admin/subscriptions");
}

async function deleteMerchant(merchantId: string) {
  "use server";
  const admin = createAdminClient();
  await admin.from("merchants").delete().eq("id", merchantId);
  redirect("/admin/subscriptions");
}
