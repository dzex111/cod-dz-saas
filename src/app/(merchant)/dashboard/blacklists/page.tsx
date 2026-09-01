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
      <h1 className="text-xl font-black text-zinc-900">القائمة السوداء — مجانية</h1>
      <p className="text-sm text-zinc-700 font-medium">أي رقم هنا يُعلم تلقائياً كـ <span className="font-bold text-red-600">fake</span> عند الطلب.</p>
      <form onSubmit={add} className="bg-white rounded-2xl border-2 border-zinc-200 p-5 flex gap-2">
        <input required placeholder="07XXXXXXXX" value={phone} onChange={e=>setPhone(e.target.value)} className="flex-1 border-2 border-zinc-300 rounded-xl px-4 py-3 text-left bg-white focus:border-zinc-900 outline-none" dir="ltr" />
        <input placeholder="السبب" value={reason} onChange={e=>setReason(e.target.value)} className="w-32 border-2 border-zinc-300 rounded-xl px-3 py-3 bg-white focus:border-zinc-900 outline-none" />
        <button className="px-5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black">حظر</button>
      </form>
      <div className="bg-white rounded-2xl border-2 border-zinc-200 overflow-hidden">
        <div className="divide-y">
          {list.map(e=>(
            <div key={e.id} className="p-4 flex justify-between items-center">
              <div><div className="font-mono font-bold" dir="ltr">{e.phone_number}</div><div className="text-xs text-zinc-600">{e.reason} • {new Date(e.created_at).toLocaleDateString("ar-DZ")}</div></div>
              <button onClick={()=>remove(e.id)} className="text-xs bg-white border-2 border-zinc-300 px-3 py-1 rounded-full font-bold hover:bg-zinc-50">إزالة</button>
            </div>
          ))}
          {list.length===0 && <div className="p-8 text-center text-zinc-600 font-medium">لا أرقام محظورة — نظيف ✓</div>}
        </div>
      </div>
    </div>
  );
}
