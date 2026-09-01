import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminSubsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "kinezedge@gmail.com").split(",").map(s=>s.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || "")) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-black text-zinc-900">غير مصرح</h1>
        <p className="text-zinc-700 mt-2">هذه اللوحة للأدمن فقط — {user.email}</p>
        <p className="text-xs text-zinc-500 mt-4">أضف بريدك في ADMIN_EMAILS في Vercel ENV</p>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: pays } = await admin.from("subscription_payments").select("*, merchants(business_name,subdomain)").eq("payment_method","baridimob").eq("status","pending").order("created_at", { ascending: false });

  return <AdminClient pays={pays || []} />;
}

function AdminClient({ pays: initialPays }: { pays: Array<{ id: string; merchant_id: string; transaction_reference: string; amount: number; proof_image_path: string | null; merchants: { business_name: string; subdomain: string } | null }> }) {
  // Client actions via server actions — نستخدم form actions لضمان حماية
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-zinc-900">مراجعة دفعات BaridiMob — الأدمن</h1>
      <p className="text-sm text-zinc-700">مجاني 0% — راجع الإيصال ثم وافق لتمديد شهر.</p>
      <div className="bg-white rounded-2xl border-2 border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50"><tr><th className="px-4 py-3 text-right font-bold text-zinc-900">المتجر</th><th className="px-4 py-3 font-bold">المرجع</th><th className="px-4 py-3 font-bold">المبلغ</th><th className="px-4 py-3 font-bold">الإيصال</th><th className="px-4 py-3 font-bold">إجراء</th></tr></thead>
          <tbody className="divide-y">
            {initialPays.length===0 && <tr><td colSpan={5} className="text-center py-10 text-zinc-500 font-medium">لا توجد دفعات معلقة</td></tr>}
            {initialPays.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3"><div className="font-bold text-zinc-900">{p.merchants?.business_name}</div><div className="text-xs text-zinc-600 font-mono" dir="ltr">{p.merchants?.subdomain}</div></td>
                <td className="px-4 py-3 font-mono text-xs font-bold" dir="ltr">{p.transaction_reference}</td>
                <td className="px-4 py-3 font-bold">{p.amount} دج</td>
                <td className="px-4 py-3">{p.proof_image_path ? <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/baridimob-proofs/${p.proof_image_path}`} target="_blank" className="text-zinc-900 font-bold underline">عرض</a> : "—"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <form action={approveAction.bind(null, p.id, p.merchant_id, true)}><button className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg font-bold text-xs">موافقة + تمديد شهر</button></form>
                  <form action={approveAction.bind(null, p.id, p.merchant_id, false)}><button className="px-3 py-1.5 bg-white border-2 border-zinc-300 rounded-lg font-bold text-xs">رفض</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
