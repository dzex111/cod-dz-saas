"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Provider = "yalidine" | "zr_express";

export default function ShippingPage() {
  const supabase = createClient();
  const [provider, setProvider] = useState<Provider>("yalidine");
  const [form, setForm] = useState({ api_id: "", api_token: "" });
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<Record<string, { api_id: string; is_active: boolean }>>({});

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
    if (!mem) return;
    const { data } = await supabase.from("shipping_configs").select("*").eq("merchant_id", mem.merchant_id);
    const map: Record<string, { api_id: string; is_active: boolean }> = {};
    data?.forEach((c) => { map[c.provider_name] = { api_id: c.api_id, is_active: c.is_active }; });
    setExisting(map);
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const e = existing[provider];
    if (e) setForm({ api_id: e.api_id, api_token: "" });
    else setForm({ api_id: "", api_token: "" });
  }, [provider, existing]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
    if (!mem) return;
    const { error } = await supabase.from("shipping_configs").upsert({
      merchant_id: mem.merchant_id,
      provider_name: provider,
      api_id: form.api_id,
      api_token: form.api_token,
      is_active: true,
    }, { onConflict: "merchant_id,provider_name" });
    if (!error) { setSaved(true); setTimeout(()=>setSaved(false), 3000); load(); }
    else alert(error.message);
  }

  return (
    <div className="max-w-xl space-y-6 bg-background">
      <h1 className="text-xl font-extrabold text-foreground">إعدادات الشحن — مجاني للمنصة</h1>
      <p className="text-sm font-medium text-muted-soft">اختر شريكك اللوجستي — كل تاجر بحسابه الخاص، المنصة لا تأخذ عمولة شحن.</p>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>setProvider("yalidine")} className={`p-4 rounded-2xl border text-right flex flex-col items-end gap-1 ${provider === "yalidine" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"}`}>
          <div className="font-extrabold">Yalidine</div>
          <div className="text-xs text-muted-soft">تغطية 58 ولاية</div>
          {existing.yalidine && <div className="text-xs mt-1 font-bold">✓ مربوط</div>}
        </button>
        <button onClick={()=>setProvider("zr_express")} className={`p-4 rounded-2xl border text-right flex flex-col items-end gap-1 ${provider === "zr_express" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"}`}>
          <div className="font-extrabold">ZR Express</div>
          <div className="text-xs text-muted-soft">شريك ثانٍ — نفس المبدأ</div>
          {existing.zr_express && <div className="text-xs mt-1 font-bold">✓ مربوط</div>}
        </button>
      </div>

      {existing[provider] && <div className="bg-card/2 border border-primary/20 rounded-xl p-3 text-sm font-bold text-primary">مربوط حالياً — ID: {existing[provider].api_id} ✓</div>}

      <form onSubmit={save} className="bg-card rounded-2xl border border-card p-6 space-y-4">
        <h3 className="font-extrabold text-foreground">{provider==="yalidine"?"Yalidine — X-API-ID / X-API-TOKEN":"ZR Express — API ID / API TOKEN"}</h3>
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">API ID</label>
          <input required placeholder="مثال: 123456" value={form.api_id} onChange={(e) => setForm({ ...form, api_id: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground focus:border-primary outline-none" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">API TOKEN / KEY</label>
          <input required placeholder="التوكن من لوحة الشحن" value={form.api_token} onChange={(e) => setForm({ ...form, api_token: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground focus:border-primary outline-none" dir="ltr" />
        </div>
        <p className="text-sm text-muted-soft font-medium leading-5">تجده في لوحة {provider==="yalidine"?"Yalidine":"ZR Express"} → الإعدادات → API. يبقى في حسابك فقط.</p>
        <button className="w-full bg-card border border-primary rounded-xl py-3.5 font-bold text-primary hover:bg-primary/5 disabled:opacity-40 shadow-sm">حفظ ربط {provider==="yalidine"?"Yalidine":"ZR Express"}</button>
        {saved && <div className="text-primary text-sm font-bold text-center">تم الحفظ بنجاح ✓</div>}
      </form>

      <div className="bg-card/2 border border-primary/20 rounded-xl p-4 text-sm leading-6 font-medium text-primary">
        ⚠️ تغطية 58 ولاية: يمكنك ربط الاثنين معاً — زر الشحن في الطلبات سيجرب Yalidine أولاً ثم ZR تلقائياً إن فشل الأول.
      </div>
    </div>
  );
}