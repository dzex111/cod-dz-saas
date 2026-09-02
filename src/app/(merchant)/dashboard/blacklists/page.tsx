"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Entry = { id: string; phone_number: string; reason: string | null; created_at: string };

export default function BlacklistsPage() {
  const supabase = createClient();
  const [list, setList] = useState<Entry[]>([]);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
    if (!mem) return;
    const { data } = await supabase.from("blacklists").select("*").eq("merchant_id", mem.merchant_id).order("created_at", { ascending: false }).limit(100);
    if (data) setList(data as Entry[]);
  }
  useEffect(()=>{ load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const clean = phone.replace(/[^0-9]/g,"");
    if (!/^(05|06|07)[0-9]{8}$/.test(clean)) { alert("رقم غير صحيح"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
    const { error } = await supabase.from("blacklists").insert({ merchant_id: mem!.merchant_id, phone_number: clean, reason: reason || "يدوي" });
    if (error) alert(error.message);
    else { setPhone(""); setReason(""); load(); }
  }

  async function remove(id: string) {
    await supabase.from("blacklists").delete().eq("id", id);
    load();
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-extrabold text-foreground">القائمة السوداء — مجانية</h1>
      <p className="text-sm font-medium">أي رقم هنا يُعلم تلقائياً كـ <span className="font-bold text-red-500">fake</span> عند الطلب.</p>
      <form onSubmit={add} className="bg-card rounded-2xl border border-border p-5 flex gap-2">
        <input required placeholder="07XXXXXXXX" value={phone} onChange={e=>setPhone(e.target.value)} className="flex-1 border border-border rounded-xl px-4 py-3 text-left bg-card focus:border-primary outline-none" dir="ltr" />
        <input placeholder="السبب" value={reason} onChange={e=>setReason(e.target.value)} className="border border-border rounded-xl px-3 py-3 bg-card focus:border-primary outline-none" />
        <button className="px-5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark">حظر</button>
      </form>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="divide-y">
          {list.map(e=>(
            <div key={e.id} className="p-4 flex justify-between items-center">
              <div><div className="font-mono font-bold" dir="ltr">{e.phone_number}</div><div className="text-sm text-muted-soft">{e.reason} • {new Date(e.created_at).toLocaleDateString("ar-DZ")}</div></div>
              <button onClick={()=>remove(e.id)} className="text-xs bg-card border border-border rounded-full font-bold hover:bg-border">إزالة</button>
            </div>
          ))}
          {list.length===0 && <div className="p-8 text-center text-muted-soft font-medium">لا أرقام محظورة — نظيف ✓</div>}
        </div>
      </div>
    </div>
  );
}