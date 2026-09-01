"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Coupon = { id: string; code: string; discount_percent: number; is_active: boolean };

export default function CouponsPage() {
  const supabase = createClient();
  const [list, setList] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", discount: "" });

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
    if (!mem) return;
    const { data } = await supabase.from("coupons").select("*").eq("merchant_id", mem.merchant_id).order("created_at", { ascending: false });
    if (data) setList(data as Coupon[]);
  }
  useEffect(()=>{ load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const code = form.code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const discount = Number(form.discount);
    if (!code || discount <1 || discount>90) { alert("كود أو خصم غير صالح"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
    const { error } = await supabase.from("coupons").insert({ merchant_id: mem!.merchant_id, code, discount_percent: discount, is_active: true });
    if (error) alert(error.message);
    else { setForm({ code:"", discount:""}); load(); }
  }

  async function toggle(c: Coupon) {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    load();
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-black text-zinc-900">كوبونات خصم — مجانية</h1>
      <p className="text-sm text-zinc-700 font-medium">أنشئ كود خصم لزبائنك — يطبق في صفحة الهبوط (قريباً).</p>
      <form onSubmit={create} className="bg-white rounded-2xl border-2 border-zinc-200 p-5 flex gap-2">
        <input required placeholder="كود: RAMADAN10" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} className="flex-1 border-2 border-zinc-300 rounded-xl px-4 py-3 font-mono text-left bg-white focus:border-zinc-900 outline-none" dir="ltr" />
        <input required placeholder="%" type="number" min={5} max={90} value={form.discount} onChange={e=>setForm({...form, discount:e.target.value})} className="w-24 border-2 border-zinc-300 rounded-xl px-4 py-3 bg-white focus:border-zinc-900 outline-none" />
        <button className="px-5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black">إضافة</button>
      </form>
      <div className="bg-white rounded-2xl border-2 border-zinc-200 overflow-hidden">
        <div className="divide-y">
          {list.map(c=>(
            <div key={c.id} className="p-4 flex justify-between items-center">
              <div><div className="font-mono font-black" dir="ltr">{c.code}</div><div className="text-xs font-bold text-emerald-700">{c.discount_percent}% خصم</div></div>
              <button onClick={()=>toggle(c)} className={`px-3 py-1 rounded-full text-xs font-bold border ${c.is_active?"bg-zinc-900 text-white border-zinc-900":"bg-white text-zinc-600 border-zinc-300"}`}>{c.is_active?"نشط":"موقف"}</button>
            </div>
          ))}
          {list.length===0 && <div className="p-8 text-center text-zinc-600 font-medium">لا كوبونات — أنشئ أول واحد</div>}
        </div>
      </div>
    </div>
  );
}
