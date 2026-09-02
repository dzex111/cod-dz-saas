"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  wilaya_name: string;
  baladia_name: string;
  address: string;
  total_price: number;
  confirmation_status: string;
  shipping_status: string;
  tracking_number: string | null;
  created_at: string;
};

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const pageSize = 20;

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
    if (!mem) return;
    let q = supabase.from("orders").select("*", { count: "exact" }).eq("merchant_id", mem.merchant_id).order("created_at", { ascending: false }).range(page*pageSize, (page+1)*pageSize-1);
    if (filter !== "all") q = q.eq("confirmation_status", filter);
    if (search.trim()) {
      const s = search.trim();
      q = q.or(`customer_phone.ilike.%${s}%,customer_name.ilike.%${s}%`);
    }
    const { data, count } = await q;
    if (data) setOrders(data as Order[]);
    if (count !== null) setTotal(count);
  }
  useEffect(() => { load(); }, [filter, page, search]);

  function exportCSV() {
    const header = ["الاسم","الهاتف","الولاية","البلدية","العنوان","السعر","الحالة","الشحن","التتبع","التاريخ"];
    const rows = orders.map(o => [o.customer_name, o.customer_phone, o.wilaya_name, o.baladia_name, o.address.replace(/,/g," "), o.total_price, o.confirmation_status, o.shipping_status, o.tracking_number||"", new Date(o.created_at).toLocaleDateString("ar-DZ")]);
    const csv = [header, ...rows].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`orders-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  }

  async function updateStatus(id: string, status: string) {
    const o = orders.find(x=>x.id===id);
    const old = o?.confirmation_status || "";
    await supabase.from("orders").update({ confirmation_status: status }).eq("id", id);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
    if (mem) await supabase.from("order_logs").insert({ order_id: id, merchant_id: mem.merchant_id, action: "confirmation_status", old_value: old, new_value: status, created_by: user.id });
    load();
  }
  async function addToBlacklist(phone: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
    if (!mem) return;
    await supabase.from("blacklists").insert({ merchant_id: mem.merchant_id, phone_number: phone, reason: "طلب وهمي" });
    alert("تمت إضافة الرقم للقائمة السوداء");
  }
  async function ship(id: string, provider: string = "yalidine") {
    setLoadingId(id);
    const res = await fetch(`/api/orders/${id}/ship`, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ provider }) });
    const j = await res.json();
    if (!res.ok) alert(j.error || "فشل الشحن");
    else alert(`تم الإرسال عبر ${provider==="yalidine"?"Yalidine":"ZR Express"} — تتبع: ${j.tracking}`);
    setLoadingId(null);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">الطلبات — {total} طلب</h1>
          <p className="text-sm text-muted">إدارة وتأكيد وشحن — كل شيء من هنا.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input placeholder="بحث: اسم أو هاتف" value={search} onChange={(e)=>{setSearch(e.target.value); setPage(0);}} className="border border-border rounded-xl px-3.5 py-2.5 text-sm w-44 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-card placeholder:text-muted-soft" />
          <select value={filter} onChange={(e) => {setFilter(e.target.value); setPage(0);}} className="border border-border rounded-xl px-3 py-2.5 text-sm font-bold bg-card focus:border-primary outline-none">
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="fake">وهمي</option>
            <option value="double">مكرر</option>
            <option value="canceled">ملغى</option>
          </select>
          <button onClick={exportCSV} className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold hover:bg-card-hover transition-colors">تصدير CSV</button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card-hover/50 border-b border-border">
              <tr className="text-xs tracking-widest text-muted-soft uppercase">
                <th className="px-4 py-3 text-right font-bold">الزبون</th>
                <th className="px-4 py-3 text-center font-bold">الولاية</th>
                <th className="px-4 py-3 text-center font-bold">الحالة</th>
                <th className="px-4 py-3 text-center font-bold">الشحن</th>
                <th className="px-4 py-3 text-center font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-card-hover/50 transition-colors">
                  <td className="px-4 py-3"><div className="font-bold text-foreground">{o.customer_name}</div><div className="text-xs text-muted font-mono" dir="ltr">{o.customer_phone}</div><div className="text-xs text-muted-soft">{new Date(o.created_at).toLocaleString("ar-DZ")}</div></td>
                  <td className="px-4 py-3 text-center text-foreground font-medium">{o.wilaya_name} - {o.baladia_name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${o.confirmation_status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : o.confirmation_status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : o.confirmation_status === "fake" ? "bg-red-50 text-red-700 border-red-200" : o.confirmation_status === "double" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>
                      {o.confirmation_status === "pending" ? "قيد الانتظار" : o.confirmation_status === "confirmed" ? "مؤكد" : o.confirmation_status === "fake" ? "وهمي" : o.confirmation_status === "double" ? "مكرر" : o.confirmation_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center"><span className="text-xs font-bold px-2 py-1 rounded-full bg-background border border-border">{o.shipping_status}</span>{o.tracking_number && <div className="text-xs font-mono text-primary mt-1" dir="ltr">{o.tracking_number}</div>}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <a href={`/dashboard/orders/${o.id}`} className="px-2.5 py-1.5 bg-background border border-border rounded-full text-xs font-bold hover:bg-card-hover">تفاصيل</a>
                      <button onClick={() => updateStatus(o.id, "confirmed")} className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700">تأكيد</button>
                      <button onClick={() => updateStatus(o.id, "canceled")} className="px-2.5 py-1.5 bg-background border border-border rounded-full text-xs font-bold hover:bg-card-hover">إلغاء</button>
                      <button onClick={() => addToBlacklist(o.customer_phone)} className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold">حظر</button>
                      <button onClick={() => ship(o.id, "yalidine")} disabled={loadingId===o.id || o.shipping_status==="shipped"} className="px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold disabled:opacity-40 hover:bg-primary-hover">Yalidine</button>
                      <button onClick={() => ship(o.id, "zr_express")} disabled={loadingId===o.id || o.shipping_status==="shipped"} className="px-3 py-1.5 bg-card border border-primary text-ink rounded-full text-xs font-bold disabled:opacity-40 hover:bg-card-hover">ZR</button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length===0 && <tr><td colSpan={5} className="text-center py-10 text-muted text-sm">لا توجد طلبات — pagination يوفّر الموارد</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-muted font-medium text-xs">صفحة {page+1} / {Math.max(1, Math.ceil(total/pageSize))} — {total} طلب</span>
        <div className="flex gap-2">
          <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="px-4 py-2 border border-border rounded-xl font-bold disabled:opacity-40 bg-card hover:bg-card-hover text-sm">السابق</button>
          <button disabled={(page+1)*pageSize >= total} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 bg-primary text-white rounded-xl font-bold disabled:opacity-40 hover:bg-primary-hover text-sm">التالي</button>
        </div>
      </div>
    </div>
  );
}
