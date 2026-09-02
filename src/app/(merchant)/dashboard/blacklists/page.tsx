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
    if (!user) return;
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
    if (!mem) return;
    const { error } = await supabase.from("blacklists").insert({ merchant_id: mem.merchant_id, phone_number: clean, reason: reason || "يدوي" });
    if (error) alert(error.message);
    else { setPhone(""); setReason(""); load(); }
  }

  async function remove(id: string) {
    await supabase.from("blacklists").delete().eq("id", id);
    load();
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-black tracking-tight text-foreground">القائمة السوداء</h1>
        <p className="text-sm text-muted mt-1">أي رقم هنا يُعلم تلقائياً كـ <span className="font-bold text-red-600">وهمي</span> عند الطلب — مجانية.</p>
      </div>
      <form onSubmit={add} className="bg-card rounded-xl border border-border p-4 flex gap-2 shadow-sm">
        <input required placeholder="07XXXXXXXX" value={phone} onChange={e=>setPhone(e.target.value)} className="flex-1 border border-border rounded-xl px-4 py-3 text-left bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm placeholder:text-muted-soft" dir="ltr" />
        <input placeholder="السبب" value={reason} onChange={e=>setReason(e.target.value)} className="border border-border rounded-xl px-3 py-3 bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm w-32" />
        <button className="px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors text-sm">حظر</button>
      </form>
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {list.map(e=>(
            <div key={e.id} className="p-4 flex justify-between items-center hover:bg-card-hover/50 transition-colors">
              <div><div className="font-mono font-bold text-foreground" dir="ltr">{e.phone_number}</div><div className="text-xs text-muted mt-0.5">{e.reason} • {new Date(e.created_at).toLocaleDateString("ar-DZ")}</div></div>
              <button onClick={()=>remove(e.id)} className="text-xs bg-background border border-border rounded-full px-3 py-1.5 font-bold hover:bg-card-hover transition-colors">إزالة</button>
            </div>
          ))}
          {list.length===0 && <div className="p-10 text-center text-muted text-sm bg-background">لا أرقام محظورة — نظيف ✓</div>}
        </div>
      </div>
    </div>
  );
}
