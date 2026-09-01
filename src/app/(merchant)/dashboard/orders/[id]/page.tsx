import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
  if (!mem) redirect("/register");

  const { data: order } = await supabase.from("orders").select("*, products(name)").eq("id", id).eq("merchant_id", mem.merchant_id).single();
  if (!order) return notFound();
  const { data: logs } = await supabase.from("order_logs").select("*").eq("order_id", id).order("created_at", { ascending: false }).limit(20);

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/orders" className="text-sm font-bold text-zinc-700 hover:text-zinc-900">← العودة للطلبات</Link>
      <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-zinc-900">طلب #{order.id.slice(0,8)}</h1>
            <p className="text-sm text-zinc-600">{new Date(order.created_at).toLocaleString("ar-DZ")}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.confirmation_status==="confirmed"?"bg-emerald-600 text-white":order.confirmation_status==="fake"?"bg-red-600 text-white":order.confirmation_status==="double"?"bg-amber-500 text-white":"bg-zinc-900 text-white"}`}>{order.confirmation_status}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-zinc-50 rounded-xl p-4 border">
            <div className="font-bold text-zinc-900">الزبون</div>
            <div className="mt-1 font-medium">{order.customer_name}</div>
            <div className="font-mono text-zinc-700" dir="ltr">{order.customer_phone}</div>
            <div className="text-zinc-600">{order.wilaya_name} - {order.baladia_name}</div>
            <div className="text-zinc-600">{order.address}</div>
          </div>
          <div className="bg-zinc-50 rounded-xl p-4 border">
            <div className="font-bold text-zinc-900">المنتج والشحن</div>
            <div className="mt-1">{(order.products as {name:string}|null)?.name || "منتج"}</div>
            <div className="font-black">{order.total_price} دج</div>
            <div className="text-xs mt-1">الشحن: {order.shipping_status} {order.shipping_provider?`(${order.shipping_provider})`:""}</div>
            {order.tracking_number && <div className="font-mono text-xs font-bold" dir="ltr">{order.tracking_number}</div>}
            {order.waybill_pdf_url && <a href={order.waybill_pdf_url} target="_blank" className="text-xs font-bold text-emerald-700 underline">تحميل الوصل</a>}
          </div>
        </div>

        <form action={async (formData: FormData) => {
          "use server";
          const notes = formData.get("notes") as string;
          const s = await createClient();
          await s.from("orders").update({ notes }).eq("id", id);
          redirect(`/dashboard/orders/${id}`);
        }} className="space-y-2">
          <label className="block text-sm font-bold text-zinc-900">ملاحظات داخلية (لا يراها الزبون)</label>
          <textarea name="notes" defaultValue={order.notes || ""} rows={3} placeholder="مثال: اتصل مرتين، طلب تأجيل..." className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 bg-white focus:border-zinc-900 outline-none" />
          <button className="px-5 py-2 bg-zinc-900 text-white rounded-xl font-bold text-sm">حفظ الملاحظة</button>
        </form>

        <div className="flex gap-2">
          <Link href={`/track/${order.tracking_number || order.id}`} className="flex-1 text-center py-3 bg-white border-2 border-zinc-300 rounded-xl font-bold hover:bg-zinc-50">صفحة تتبع الزبون</Link>
        </div>

        <div className="bg-white rounded-2xl border-2 border-zinc-200 p-5">
          <h3 className="font-black text-zinc-900 mb-3">سجل النشاط — مجاني</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-zinc-50 p-3 rounded-xl border">
              <span className="font-bold">إنشاء الطلب</span><span className="text-zinc-600 font-mono text-xs">{new Date(order.created_at).toLocaleString("ar-DZ")}</span>
            </div>
            {order.confirmed_at && <div className="flex justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-200"><span className="font-bold text-emerald-900">تأكيد</span><span className="text-xs">{new Date(order.confirmed_at).toLocaleString("ar-DZ")}</span></div>}
            {logs && logs.length > 0 ? logs.map(l=>(
              <div key={l.id} className="flex justify-between bg-zinc-50 p-3 rounded-xl border text-xs">
                <span className="font-bold">{l.action}: {l.old_value} → {l.new_value}</span><span className="text-zinc-500">{new Date(l.created_at).toLocaleString("ar-DZ")}</span>
              </div>
            )) : <div className="text-center text-zinc-500 text-xs py-2">لا نشاط إضافي</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
