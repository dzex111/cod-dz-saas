"use client";
import { useState } from "react";
import { WILAYAS } from "@/lib/data/wilayas";

export default function CheckoutForm({ merchantSubdomain, productSlug, price }: { merchantSubdomain: string; productSlug: string; price: number }) {
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", wilaya_code: "16", baladia_name: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; status?: string } | null>(null);

  const wilayaName = WILAYAS.find((w) => w.code === form.wilaya_code)?.name || "";

  const [attempts, setAttempts] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // debounce: منع الإرسال المزدوج
    if (attempts >= 3) {
      setResult({ error: "حاولت كثيراً — انتظر دقيقة" });
      return;
    }
    setLoading(true);
    setResult(null);
    // client phone validation
    if (!/^(05|06|07)[0-9]{8}$/.test(form.customer_phone)) {
      setResult({ error: "رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05/06/07 ويحتوي 10 أرقام)" });
      setLoading(false);
      return;
    }
    if (form.baladia_name.trim().length < 2) {
      setResult({ error: "البلدية مطلوبة (حرفين على الأقل)" });
      setLoading(false);
      return;
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
      // Zod flatten يعيد {fieldErrors, formErrors} وليس issues
      const fieldErr = j.error?.fieldErrors ? Object.values(j.error.fieldErrors).flat().join("، ") : "";
      const formErr = j.error?.formErrors?.join("، ") || "";
      const msg = j.error?.issues?.[0]?.message || fieldErr || formErr || (typeof j.error === "string" ? j.error : j.error?.message) || j.message || "فشل الطلب — تحقق من البيانات";
      setResult({ error: msg });
      setAttempts((a) => a + 1);
      setTimeout(() => setAttempts(0), 60_000);
    } else {
      setResult({ success: true, status: j.status });
      setForm({ customer_name: "", customer_phone: "", wilaya_code: "16", baladia_name: "", address: "" });
      setAttempts(0);
    }
    setLoading(false);
  }

  if (result?.success) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 className="font-black text-emerald-900 dark:text-emerald-100 text-lg">تم استلام طلبك بنجاح</h3>
        <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-2 font-medium">سيتصل بك فريقنا قريباً لتأكيد الطلب. السعر الإجمالي: {price.toLocaleString("fr-DZ")} دج + توصيل</p>
        <button onClick={() => setResult(null)} className="mt-5 px-6 py-2.5 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-50 transition">طلب جديد</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {result?.error && <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 p-3 rounded-xl text-sm font-bold">{result.error}</div>}
      <div>
        <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">الاسم الكامل</label>
        <input required placeholder="مثال: أحمد بن علي" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-500 outline-none transition" />
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">رقم الهاتف</label>
        <input required placeholder="07XXXXXXXX" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-500 outline-none text-left" dir="ltr" />
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium">05 / 06 / 07 + 8 أرقام</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">الولاية</label>
          <select value={form.wilaya_code} onChange={(e) => setForm({ ...form, wilaya_code: e.target.value })} className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3.5 bg-white dark:bg-zinc-900 font-bold focus:border-zinc-900 outline-none">
            {WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">البلدية</label>
          <input required placeholder="باب الواد" value={form.baladia_name} onChange={(e) => setForm({ ...form, baladia_name: e.target.value })} className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3.5 bg-white dark:bg-zinc-900 focus:border-zinc-900 outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">العنوان الكامل</label>
        <textarea required placeholder="الشارع، الحي، رقم المنزل، قرب مسجد/مدرسة..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3.5 bg-white dark:bg-zinc-900 focus:border-zinc-900 outline-none" rows={3} />
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">5 أحرف على الأقل — كلما كان أوضح، وصل أسرع</p>
      </div>
      <div className="bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex justify-between items-center">
        <span className="font-bold text-zinc-700 dark:text-zinc-300">المجموع (دفع عند الاستلام)</span><span className="font-black text-xl text-zinc-900 dark:text-white">{price.toLocaleString("fr-DZ")} دج</span>
      </div>
      <button disabled={loading} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black text-[16px] hover:bg-black dark:hover:bg-zinc-100 disabled:opacity-50 transition shadow-sm">{loading ? "جاري الإرسال..." : "تأكيد الطلب"}</button>
      <p className="text-xs text-center text-zinc-600 dark:text-zinc-400 font-medium flex items-center justify-center gap-1.5"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 1l7 4v6c0 5-3.5 7.5-7 8-3.5-.5-7-3-7-8V6l7-4z" /></svg> بياناتك محمية — للتواصل حول الطلب فقط</p>
    </form>
  );
}
