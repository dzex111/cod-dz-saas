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
    // سجل نشاط مجاني
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-xl font-black text-zinc-900">الطلبات — {total} طلب</h1>
        <div className="flex gap-2 flex-wrap">
          <input placeholder="بحث: اسم أو هاتف" value={search} onChange={(e)=>{setSearch(e.target.value); setPage(0);}} className="border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm w-44 focus:border-zinc-900 outline-none bg-white" />
          <select value={filter} onChange={(e) => {setFilter(e.target.value); setPage(0);}} className="border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm bg-white font-bold focus:border-zinc-900 outline-none">
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="fake">وهمي</option>
            <option value="double">مكرر</option>
            <option value="canceled">ملغى</option>
          </select>
          <button onClick={exportCSV} className="px-3 py-2 bg-white border-2 border-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-50">تصدير CSV مجاني</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border-2 border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-700">
              <tr>
                <th className="px-4 py-3 text-right font-black">الزبون</th>
                <th className="px-4 py-3 font-bold">الولاية</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">الشحن</th>
                <th className="px-4 py-3 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3"><div className="font-medium">{o.customer_name}</div><div className="text-xs text-zinc-500" dir="ltr">{o.customer_phone}</div><div className="text-xs text-zinc-400">{new Date(o.created_at).toLocaleString("ar-DZ")}</div></td>
                  <td className="px-4 py-3 text-center">{o.wilaya_name} - {o.baladia_name}<div className="text-xs text-zinc-500">{o.address.slice(0, 30)}</div></td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${o.confirmation_status==="pending"?"bg-amber-100 text-amber-700":o.confirmation_status==="confirmed"?"bg-emerald-100 text-emerald-700":o.confirmation_status==="fake"?"bg-red-100 text-red-700":o.confirmation_status==="double"?"bg-orange-100 text-orange-700":"bg-zinc-100"}`}>{o.confirmation_status}</span><div className="text-xs mt-1">{o.total_price} دج</div></td>
                  <td className="px-4 py-3 text-center"><span className="text-xs">{o.shipping_status}</span>{o.tracking_number && <div className="text-xs font-mono text-emerald-600" dir="ltr">{o.tracking_number}</div>}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <a href={`/dashboard/orders/${o.id}`} className="px-2 py-1 bg-white border-2 border-zinc-900 text-zinc-900 rounded-lg text-xs font-bold hover:bg-zinc-50">تفاصيل</a>
                      <button onClick={() => updateStatus(o.id, "confirmed")} className="px-2 py-1 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-black">تأكيد</button>
                      <button onClick={() => updateStatus(o.id, "canceled")} className="px-2 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-bold">إلغاء</button>
                      <button onClick={() => addToBlacklist(o.customer_phone)} className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-bold">حظر</button>
                      <button onClick={() => ship(o.id, "yalidine")} disabled={loadingId===o.id || o.shipping_status==="shipped"} className="px-2 py-1 bg-zinc-900 text-white rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-black">Yalidine</button>
                      <button onClick={() => ship(o.id, "zr_express")} disabled={loadingId===o.id || o.shipping_status==="shipped"} className="px-2 py-1 bg-white border-2 border-zinc-900 text-zinc-900 rounded-lg text-xs font-bold disabled:opacity-40">ZR</button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length===0 && <tr><td colSpan={5} className="text-center py-10 text-zinc-600 font-medium">لا توجد طلبات — pagination يوفّر 500MB</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-zinc-700 font-bold">صفحة {page+1} / {Math.max(1, Math.ceil(total/pageSize))} — {total} طلب</span>
        <div className="flex gap-2">
          <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="px-4 py-2 border-2 border-zinc-300 rounded-xl font-bold disabled:opacity-40 bg-white">السابق</button>
          <button disabled={(page+1)*pageSize >= total} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold disabled:opacity-40">التالي</button>
        </div>
      </div>
    </div>
  );
}
