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
    if (!user) return;
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
    if (!mem) return;
    const { error } = await supabase.from("coupons").insert({ merchant_id: mem.merchant_id, code, discount_percent: discount, is_active: true });
    if (error) alert(error.message);
    else { setForm({ code:"", discount:""}); load(); }
  }

  async function toggle(c: Coupon) {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    load();
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-black tracking-tight text-foreground">كوبونات خصم</h1>
        <p className="text-sm text-muted mt-1">أنشئ كود خصم لزبائنك — يطبق في صفحة الهبوط.</p>
      </div>
      <form onSubmit={create} className="bg-card rounded-xl border border-border p-4 flex gap-2 shadow-sm">
        <input required placeholder="كود: RAMADAN10" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="flex-1 border border-border rounded-xl px-4 py-3 font-mono text-left bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm placeholder:text-muted-soft" dir="ltr" />
        <input required placeholder="%" type="number" min={5} max={90} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="w-24 border border-border rounded-xl px-4 py-3 bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm" />
        <button className="px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors text-sm">إضافة</button>
      </form>
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {list.map(c=>(
            <div key={c.id} className="p-4 flex justify-between items-center hover:bg-card-hover/50 transition-colors">
              <div><div className="font-mono font-bold text-foreground" dir="ltr">{c.code}</div><div className="text-sm text-emerald-600 font-bold">{c.discount_percent}% خصم</div></div>
              <button onClick={()=>toggle(c)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${c.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-background border-border text-muted"}`}>{c.is_active ? "نشط" : "موقف"}</button>
            </div>
          ))}
          {list.length===0 && <div className="p-10 text-center text-muted text-sm bg-background">لا كوبونات — أنشئ أول واحد</div>}
        </div>
      </div>
    </div>
  );
}
