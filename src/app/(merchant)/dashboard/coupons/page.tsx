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
    <div className="space-y-6 bg-background">
      <h1 className="text-xl font-extrabold text-foreground">كوبونات خصم — مجانية</h1>
      <p className="text-sm font-medium text-muted-soft">أنشئ كود خصم لزبائنك — يطبق في صفحة الهبوط (قريباً).</p>
      <form onSubmit={create} className="bg-card rounded-2xl border border-card p-5 flex gap-2">
        <input required placeholder="كود: RAMADAN10" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="flex-1 border border-border rounded-xl px-4 py-3 font-mono text-left bg-card focus:border-primary outline-none" dir="ltr" />
        <input required placeholder="%" type="number" min={5} max={90} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="w-24 border border-border rounded-xl px-4 py-3 bg-card focus:border-primary outline-none" />
        <button className="px-5 bg-card border border-primary rounded-xl text-primary font-bold hover:bg-primary/5">إضافة</button>
      </form>
      <div className="bg-card rounded-2xl border border-card overflow-hidden">
        <div className="divide-y">
          {list.map(c=>(
            <div key={c.id} className="p-4 flex justify-between items-center">
              <div><div className="font-mono font-bold text-foreground" dir="ltr">{c.code}</div><div className="text-sm text-primary">{c.discount_percent}% خصم</div></div>
              <button onClick={()=>toggle(c)} className={`px-3 py-1 rounded-full text-xs font-bold border ${c.is_active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-soft"}`}>{c.is_active ? "نشط" : "موقف"}</button>
            </div>
          ))}
          {list.length===0 && <div className="p-8 text-center text-muted-soft font-medium">لا كوبونات — أنشئ أول واحد</div>}
        </div>
      </div>
    </div>
  );
}