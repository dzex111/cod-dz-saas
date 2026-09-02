"use client";
import { useState } from "react";
import { WILAYAS } from "@/lib/data/wilayas";

export default function CheckoutForm({ merchantSubdomain, productSlug, price }: { merchantSubdomain: string; productSlug: string; price: number }) {
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", wilaya_code: "16", baladia_name: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const wilayaName = WILAYAS.find((w) => w.code === form.wilaya_code)?.name || "";
  const [attempts, setAttempts] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (attempts >= 3) { setResult({ error: "حاولت كثيراً — انتظر دقيقة" }); return; }
    setLoading(true);
    setResult(null);
    if (!/^(05|06|07)[0-9]{8}$/.test(form.customer_phone)) {
      setResult({ error: "رقم الهاتف غير صحيح (05/06/07 + 8 أرقام)" });
      setLoading(false); return;
    }
    if (form.baladia_name.trim().length < 2) {
      setResult({ error: "البلدية مطلوبة" });
      setLoading(false); return;
    }
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_subdomain: merchantSubdomain,
        product_slug: productSlug,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        wilaya_code: form.wilaya_code,
        wilaya_name: wilayaName,
        baladia_name: form.baladia_name,
        address: form.address,
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      const msg = j.error?.fieldErrors ? Object.values(j.error.fieldErrors).flat().join("، ") as string : (typeof j.error === "string" ? j.error : j.error?.message) || "فشل الطلب";
      setResult({ error: msg });
      setAttempts((a) => a + 1);
      setTimeout(() => setAttempts(0), 60000);
    } else {
      setResult({ success: true });
      setForm({ customer_name: "", customer_phone: "", wilaya_code: "16", baladia_name: "", address: "" });
      setAttempts(0);
    }
    setLoading(false);
  }

  if (result?.success) {
    return (
      <div className="bg-white border border-[#E8E6E1] rounded-[4px] p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#111] text-white flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h3 className="font-serif text-lg mt-3">تم استلام طلبك</h3>
        <p className="text-sm opacity-60 mt-2">سيتصل بك فريق التأكيد قريباً — {price.toLocaleString("fr-DZ")} DZD</p>
        <button onClick={() => setResult(null)} className="mt-6 w-full border border-[#E8E6E1] rounded-[4px] py-2.5 text-sm hover:bg-[#FAF9F6]">طلب جديد</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {result?.error && <div className="bg-[#FFF1F1] border border-[#E8E6E1] text-[#9B1C1C] text-sm rounded-[4px] p-3">{result.error}</div>}
      <div>
        <label className="text-xs tracking-[0.08em] uppercase font-medium">Nom complet</label>
        <input required placeholder="Ex: Ahmed Ben Ali" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="mt-1.5 w-full border border-[#E8E6E1] rounded-[4px] px-3 py-2.5 text-sm bg-white focus:border-[#111] outline-none" />
      </div>
      <div>
        <label className="text-xs tracking-[0.08em] uppercase font-medium">Téléphone</label>
        <input required placeholder="07XXXXXXXX" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="mt-1.5 w-full border border-[#E8E6E1] rounded-[4px] px-3 py-2.5 text-sm bg-white focus:border-[#111] outline-none text-left" dir="ltr" />
        <p className="text-[11px] opacity-50 mt-1">05 / 06 / 07 + 8 chiffres</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs tracking-[0.08em] uppercase font-medium">Wilaya</label>
          <select value={form.wilaya_code} onChange={(e) => setForm({ ...form, wilaya_code: e.target.value })} className="mt-1.5 w-full border border-[#E8E6E1] rounded-[4px] px-3 py-2.5 text-sm bg-white focus:border-[#111] outline-none">
            {WILAYAS.map((w) => <option key={w.code} value={w.code}>{w.code} - {w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs tracking-[0.08em] uppercase font-medium">Commune</label>
          <input required placeholder="Bab El Oued" value={form.baladia_name} onChange={(e) => setForm({ ...form, baladia_name: e.target.value })} className="mt-1.5 w-full border border-[#E8E6E1] rounded-[4px] px-3 py-2.5 text-sm bg-white focus:border-[#111] outline-none" />
        </div>
      </div>
      <div>
        <label className="text-xs tracking-[0.08em] uppercase font-medium">Adresse complète</label>
        <textarea required placeholder="Rue, quartier, n° — près mosquée/école..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5 w-full border border-[#E8E6E1] rounded-[4px] px-3 py-2.5 text-sm bg-white focus:border-[#111] outline-none" rows={2} />
      </div>
      <div className="flex justify-between items-center border-y border-[#E8E6E1] py-3 text-sm">
        <span className="opacity-60">Total — Paiement à la livraison</span><span className="font-serif text-lg">{price.toLocaleString("fr-DZ")} DZD</span>
      </div>
      <button disabled={loading} className="w-full bg-[#111] text-white rounded-[4px] py-3 text-xs tracking-[0.14em] uppercase hover:bg-black disabled:opacity-40 transition-colors">
        {loading ? "Envoi..." : "Confirmer la commande"}
      </button>
      <p className="text-[11px] opacity-50 text-center">Données protégées — uniquement pour la commande</p>
    </form>
  );
}
