"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BillingPage() {
  const supabase = createClient();
  const [merchant, setMerchant] = useState<{ subscription_status: string; trial_ends_at: string; subscription_ends_at: string | null } | null>(null);
  const [form, setForm] = useState({ reference: "", amount: "" });
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [chargilyLoading, setChargilyLoading] = useState(false);
  const [months, setMonths] = useState(1);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
      if (!mem) return;
      const { data } = await supabase.from("merchants").select("subscription_status,trial_ends_at,subscription_ends_at").eq("id", mem.merchant_id).single();
      if (data) setMerchant(data);
    })();
    // قراءة نتيجة العودة من Chargily
    const params = new URLSearchParams(window.location.search);
    if (params.get("chargily")==="success") setMsg("✓ تم الدفع عبر Chargily — سيُفعل اشتراكك تلقائياً عند تأكيد Webhook");
    if (params.get("chargily")==="cancel") setMsg("تم إلغاء الدفع — يمكنك المحاولة مجدداً أو استخدام BaridiMob المجاني");
  }, []);

  async function payChargily() {
    setChargilyLoading(true);
    setMsg("");
    const res = await fetch("/api/chargily/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ months }) });
    const j = await res.json();
    if (!res.ok) {
      if (j.fallback==="baridimob") setMsg("Chargily غير مفعّل حالياً (مفاتيح تجريبية) — استخدم BaridiMob المجاني 0% بالأسفل ✓");
      else setMsg(j.error || "فشل إنشاء جلسة الدفع");
      setChargilyLoading(false);
      return;
    }
    window.location.href = j.url;
  }

  async function submitBaridi(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { alert("اختر صورة الإيصال"); return; }
    if (file.size > 5*1024*1024) { alert("الصورة كبيرة — الحد 5MB"); return; }
    const fd = new FormData();
    fd.append("reference", form.reference);
    fd.append("amount", form.amount);
    fd.append("proof_image", file);
    const res = await fetch("/api/baridimob/submit", { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok) setMsg(j.error || "فشل");
    else { setMsg("✓ تم رفع الإيصال — سيتم المراجعة قريباً (مفضل للتجار الجدد بدون عمولة)"); setForm({ reference: "", amount: "" }); setFile(null); }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-extrabold text-zinc-900">الفوترة والاشتراك — مجاني + خياران</h1>
      {merchant && (
        <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-bold text-zinc-600">حالة الاشتراك</div>
              <div className="font-black text-lg text-zinc-900">{merchant.subscription_status === "active" ? "✓ مجاني — نشط" : merchant.subscription_status}</div>
              <div className="text-xs text-emerald-700 font-bold">يعمل مجاناً عبر vercel.app بدون نطاق</div>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-zinc-600">ينتهي في</div>
              <div className="font-mono text-sm font-bold text-zinc-900" dir="ltr">{merchant.subscription_ends_at ? new Date(merchant.subscription_ends_at).toLocaleDateString("ar-DZ") : new Date(merchant.trial_ends_at).toLocaleDateString("ar-DZ")}</div>
            </div>
          </div>
        </div>
      )}

      {msg && <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-900 p-3 rounded-xl text-sm font-bold text-center">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-zinc-900">دفع تلقائي — Chargily Pay</h3>
            <span className="bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">تلقائي</span>
          </div>
          <p className="text-sm text-zinc-700 font-medium leading-6">بطاقة الذهبية / CIB — يُفعل اشتراكك فوراً عبر Webhook.</p>
          <label className="block text-sm font-bold text-zinc-900">المدة</label>
          <select value={months} onChange={e=>setMonths(Number(e.target.value))} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 bg-white font-bold">
            <option value={1}>شهر — 500 دج</option>
            <option value={3}>3 أشهر — 1200 دج</option>
            <option value={6}>6 أشهر — 2000 دج</option>
            <option value={12}>سنة — 3500 دج</option>
          </select>
          <button onClick={payChargily} disabled={chargilyLoading} className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-black disabled:opacity-50 shadow-sm">{chargilyLoading?"جاري التحويل...":"ادفع عبر Chargily →"}</button>
          <p className="text-xs text-zinc-600 font-medium">اختياري — BaridiMob مجاني 0% للتجار الجدد.</p>
        </div>

        <form onSubmit={submitBaridi} className="bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-zinc-900">تحويل يدوي — BaridiMob</h3>
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">مفضل مجاني 0%</span>
          </div>
          <p className="text-xs text-zinc-700 font-bold">مفضل للتجار الجدد — بدون عمولة، مراجعة يدوية خلال دقائق.</p>
          <input required placeholder="مرجع التحويل (RIP)" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 bg-white text-zinc-900 focus:border-zinc-900 outline-none" />
          <input required placeholder="المبلغ (دج)" type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 bg-white text-zinc-900 focus:border-zinc-900 outline-none" />
          <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-2 text-sm bg-white" />
          <p className="text-[11px] text-zinc-600">الحد 5MB — تُضغط تلقائياً</p>
          <button className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 shadow-sm">رفع الإيصال للمراجعة</button>
        </form>
      </div>
    </div>
  );
}
