import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TrackPage({ params }: { params: Promise<{ tracking: string }> }) {
  const { tracking } = await params;
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("id, customer_name, wilaya_name, shipping_status, tracking_number, waybill_pdf_url, total_price, created_at, shipping_provider").or(`tracking_number.eq.${tracking},id.eq.${tracking}`).maybeSingle();

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-2">🔍</div>
          <h1 className="font-black text-zinc-900">رقم التتبع غير موجود</h1>
          <p className="text-sm text-zinc-600 mt-2">تأكد من الرقم أو تواصل مع المتجر</p>
          <Link href="/" className="inline-block mt-4 px-5 py-2 bg-zinc-900 text-white rounded-xl font-bold">الرئيسية</Link>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "not_shipped", label: "تم استلام الطلب", done: true },
    { key: "shipped", label: "تم الشحن", done: ["shipped","delivered"].includes(order.shipping_status) },
    { key: "delivered", label: "تم التوصيل", done: order.shipping_status==="delivered" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl border-2 border-zinc-200 p-7 space-y-5">
        <h1 className="text-xl font-black text-zinc-900 text-center">تتبع طلبك</h1>
        <div className="bg-zinc-900 text-white rounded-xl p-4 text-center">
          <div className="text-xs text-zinc-300">رقم التتبع</div>
          <div className="font-mono font-bold text-lg" dir="ltr">{order.tracking_number || order.id.slice(0,8)}</div>
          <div className="text-xs text-zinc-300 mt-1">{order.shipping_provider || "—"} — {order.wilaya_name}</div>
        </div>
        <div className="space-y-3">
          {steps.map(s=>(
            <div key={s.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${s.done?"bg-emerald-50 border-emerald-200":"bg-zinc-50 border-zinc-200"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${s.done?"bg-emerald-600 text-white":"bg-zinc-300 text-zinc-600"}`}>{s.done?"✓":"○"}</div>
              <div className={`font-bold ${s.done?"text-emerald-900":"text-zinc-500"}`}>{s.label}</div>
            </div>
          ))}
        </div>
        {order.waybill_pdf_url && <a href={order.waybill_pdf_url} target="_blank" className="block text-center py-3 bg-white border-2 border-zinc-300 rounded-xl font-bold hover:bg-zinc-50">تحميل وصل الشحن PDF</a>}
        <div className="text-center text-xs text-zinc-600">المجموع {order.total_price} دج — {new Date(order.created_at).toLocaleDateString("ar-DZ")}</div>
      </div>
    </div>
  );
}
