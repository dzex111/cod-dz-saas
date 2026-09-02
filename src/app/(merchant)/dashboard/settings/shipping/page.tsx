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
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-black tracking-tight text-foreground">إعدادات الشحن</h1>
        <p className="text-sm text-muted mt-1">اختر شريكك اللوجستي — كل تاجر بحسابه الخاص، لا عمولة للمنصة.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>setProvider("yalidine")} className={`p-4 rounded-lg border text-right flex flex-col gap-1 transition-colors ${provider === "yalidine" ? "border-primary bg-primary text-white shadow-sm" : "border-border bg-card text-foreground hover:bg-card-hover"}`}>
          <div className="font-black text-sm">Yalidine</div>
          <div className={`text-xs ${provider==="yalidine"?"text-white/70":"text-muted"}`}>تغطية 58 ولاية</div>
          {existing.yalidine && <div className={`text-xs mt-1 font-bold ${provider==="yalidine"?"text-emerald-300":"text-emerald-600"}`}>✓ مربوط</div>}
        </button>
        <button onClick={()=>setProvider("zr_express")} className={`p-4 rounded-lg border text-right flex flex-col gap-1 transition-colors ${provider === "zr_express" ? "border-primary bg-primary text-white shadow-sm" : "border-border bg-card text-foreground hover:bg-card-hover"}`}>
          <div className="font-black text-sm">ZR Express</div>
          <div className={`text-xs ${provider==="zr_express"?"text-white/70":"text-muted"}`}>شريك ثانٍ — نفس المبدأ</div>
          {existing.zr_express && <div className={`text-xs mt-1 font-bold ${provider==="zr_express"?"text-emerald-300":"text-emerald-600"}`}>✓ مربوط</div>}
        </button>
      </div>

      {existing[provider] && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm font-bold text-emerald-700">مربوط حالياً — ID: {existing[provider].api_id} ✓</div>}

      <form onSubmit={save} className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-foreground">{provider==="yalidine"?"Yalidine — X-API-ID / X-API-TOKEN":"ZR Express — API ID / API TOKEN"}</h3>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">API ID</label>
          <input required placeholder="مثال: 123456" value={form.api_id} onChange={(e) => setForm({ ...form, api_id: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">API TOKEN / KEY</label>
          <input required placeholder="التوكن من لوحة الشحن" value={form.api_token} onChange={(e) => setForm({ ...form, api_token: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm" dir="ltr" />
        </div>
        <p className="text-xs text-muted leading-5">تجده في لوحة {provider==="yalidine"?"Yalidine":"ZR Express"} → الإعدادات → API. يبقى في حسابك فقط.</p>
        <button className="w-full bg-primary text-white rounded-xl py-3.5 font-bold hover:bg-primary-hover transition-colors shadow-sm">حفظ ربط {provider==="yalidine"?"Yalidine":"ZR Express"}</button>
        {saved && <div className="text-emerald-600 text-sm font-bold text-center">تم الحفظ بنجاح ✓</div>}
      </form>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm leading-6 font-medium text-amber-800">
        يمكنك ربط الاثنين معاً — زر الشحن في الطلبات سيجرب Yalidine أولاً ثم ZR تلقائياً إن فشل الأول.
      </div>
    </div>
  );
}
