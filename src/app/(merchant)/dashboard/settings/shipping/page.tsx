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
      <h1 className="text-xl font-extrabold text-zinc-900">إعدادات الشحن — مجاني للمنصة</h1>
      <p className="text-sm text-zinc-700 font-medium">اختر شريكك اللوجستي — كل تاجر بحسابه الخاص، المنصة لا تأخذ عمولة شحن.</p>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>setProvider("yalidine")} className={`p-4 rounded-2xl border-2 text-right ${provider==="yalidine"?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-900"}`}>
          <div className="font-extrabold">Yalidine</div>
          <div className={`text-xs ${provider==="yalidine"?"text-zinc-300":"text-zinc-600"}`}>تغطية 58 ولاية</div>
          {existing.yalidine && <div className="text-xs mt-1 font-bold">✓ مربوط</div>}
        </button>
        <button onClick={()=>setProvider("zr_express")} className={`p-4 rounded-2xl border-2 text-right ${provider==="zr_express"?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-900"}`}>
          <div className="font-extrabold">ZR Express</div>
          <div className={`text-xs ${provider==="zr_express"?"text-zinc-300":"text-zinc-600"}`}>شريك ثانٍ — نفس المبدأ</div>
          {existing.zr_express && <div className="text-xs mt-1 font-bold">✓ مربوط</div>}
        </button>
      </div>

      {existing[provider] && <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-900 p-3 rounded-xl text-sm font-bold">مربوط حالياً — ID: {existing[provider].api_id} ✓</div>}

      <form onSubmit={save} className="bg-white rounded-2xl border-2 border-zinc-200 p-6 space-y-4">
        <h3 className="font-extrabold text-zinc-900">{provider==="yalidine"?"Yalidine — X-API-ID / X-API-TOKEN":"ZR Express — API ID / API TOKEN"}</h3>
        <div>
          <label className="block text-sm font-bold text-zinc-900 mb-1">API ID</label>
          <input required placeholder="مثال: 123456" value={form.api_id} onChange={(e) => setForm({ ...form, api_id: e.target.value })} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 text-left bg-white focus:border-zinc-900 outline-none" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-bold text-zinc-900 mb-1">API TOKEN / KEY</label>
          <input required placeholder="التوكن من لوحة الشحن" value={form.api_token} onChange={(e) => setForm({ ...form, api_token: e.target.value })} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 text-left bg-white focus:border-zinc-900 outline-none" dir="ltr" />
        </div>
        <p className="text-xs text-zinc-600 font-medium leading-5">تجده في لوحة {provider==="yalidine"?"Yalidine":"ZR Express"} → الإعدادات → API. يبقى في حسابك فقط.</p>
        <button className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-black shadow-sm">حفظ ربط {provider==="yalidine"?"Yalidine":"ZR Express"}</button>
        {saved && <div className="text-emerald-700 text-sm font-bold text-center">تم الحفظ بنجاح ✓</div>}
      </form>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-sm leading-6 font-medium text-amber-900">
        ⚠️ تغطية 58 ولاية: يمكنك ربط الاثنين معاً — زر الشحن في الطلبات سيجرب Yalidine أولاً ثم ZR تلقائياً إن فشل الأول.
      </div>
    </div>
  );
}
