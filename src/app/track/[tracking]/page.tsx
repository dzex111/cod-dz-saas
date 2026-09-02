import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TrackPage({ params }: { params: Promise<{ tracking: string }> }) {
  const { tracking } = await params;
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("id, customer_name, wilaya_name, shipping_status, tracking_number, waybill_pdf_url, total_price, created_at, shipping_provider").or(`tracking_number.eq.${tracking},id.eq.${tracking}`).maybeSingle();

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl border border-border p-8 text-center max-w-md">
          <div className="text-4xl mb-2">🔍</div>
          <h1 className="font-extrabold text-foreground">رقم التتبع غير موجود</h1>
          <p className="text-muted-soft mt-2">تأكد من الرقم أو تواصل مع المتجر</p>
          <Link href="/" className="inline-block mt-4 px-5 py-2 bg-primary text-white rounded-xl font-bold">الرئيسية</Link>
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto bg-card rounded-2xl border border-border p-7 space-y-5">
        <h1 className="text-xl font-extrabold text-foreground text-center">تتبع طلبك</h1>
        <div className="bg-card/20 rounded-xl p-4 text-center">
          <div className="text-xs text-muted-soft">رقم التتبع</div>
          <div className="font-mono font-bold text-lg" dir="ltr">{order.tracking_number || order.id.slice(0,8)}</div>
          <div className="text-xs text-muted-soft mt-1">{order.shipping_provider || "—"} — {order.wilaya_name}</div>
        </div>
        <div className="space-y-3">
          {steps.map(s=>(
            <div key={s.key} className={`flex items-center gap-3 p-3 rounded-xl border ${s.done?"border-primary/20":"border-border"} ${s.done?"bg-primary/5":"bg-card/5"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${s.done?"bg-primary":"bg-muted-soft"} ${s.done?"text-primary":"text-muted-soft"}`}>{s.done?"✓":"○"}</div>
              <div className={`font-bold ${s.done?"text-primary":"text-muted-soft"}`}>{s.label}</div>
            </div>
          ))}
        </div>
        {order.waybill_pdf_url && <a href={order.waybill_pdf_url} target="_blank" className="block text-center py-3 bg-card border border-border rounded-xl font-bold hover:bg-card/5">تحميل وصل الشحن PDF</a>}
        <div className="text-center text-xs text-muted-soft">المجموع {order.total_price} دج — {new Date(order.created_at).toLocaleDateString("ar-DZ")}</div>
      </div>
    </div>
  );
}