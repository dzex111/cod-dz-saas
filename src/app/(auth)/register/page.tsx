"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ business_name: "", subdomain: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const supabase = createClient();

  function upd(k: string, v: string) { setForm({ ...form, [k]: v }); }

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    if (!/^[a-z0-9-]{3,30}$/.test(form.subdomain)) {
      setErr("النطاق الفرعي: 3-30 حرف إنجليزي صغير/أرقام/شرطة فقط");
      setLoading(false); return;
    }
    if (!/^(05|06|07)[0-9]{8}$/.test(form.phone.replace(/[^0-9]/g,""))) {
      setErr("رقم الهاتف يجب أن يبدأ بـ 05/06/07 ويحتوي 10 أرقام");
      setLoading(false); return;
    }

    const { data: signUpData, error: signError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (signError) { setErr(signError.message); setLoading(false); return; }
    const user = signUpData.user;
    if (!user) { setErr("تم إنشاء الحساب — سجل الدخول الآن"); router.push("/login"); setLoading(false); return; }

    // إنشاء المتجر عبر API يتجاوز RLS — يتم تحديد user_id من الجلسة فقط
    const res = await fetch("/api/merchant/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: form.business_name,
        subdomain: form.subdomain.toLowerCase(),
        phone: form.phone.replace(/[^0-9]/g, ""),
      }),
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || "فشل إنشاء المتجر"); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold">C</div>
            <span className="font-extrabold text-xl text-zinc-900">COD DZ</span>
          </Link>
          <p className="text-sm font-bold text-emerald-700 mt-1">✓ مجاني 100% — مواقع حقيقية تعمل فوراً</p>
        </div>

        <form onSubmit={handle} className="bg-white rounded-2xl border-2 border-zinc-200 shadow-sm p-7 space-y-4">
          <h1 className="text-2xl font-extrabold text-zinc-900 text-center">أنشئ متجرك الآن</h1>
          {err && <div className="bg-red-50 border-2 border-red-200 text-red-900 p-3 rounded-xl text-sm font-medium">{err}</div>}

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">اسم النشاط التجاري</label>
            <input placeholder="مثال: متجر الأناقة" required value={form.business_name} onChange={(e) => upd("business_name", e.target.value)} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">النطاق الفرعي</label>
            <div className="flex rounded-xl border-2 border-zinc-300 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10 overflow-hidden bg-white">
              <input placeholder="mystore" required value={form.subdomain} onChange={(e) => upd("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} className="flex-1 px-4 py-3.5 bg-white text-zinc-900 placeholder:text-zinc-400 outline-none text-left" dir="ltr" />
              <span className="px-3 py-3.5 bg-zinc-100 text-zinc-700 text-sm font-mono border-l-2 border-zinc-300" dir="ltr">.coddz.com</span>
            </div>
            <p className="text-xs text-zinc-600 mt-1">أحرف إنجليزية صغيرة وأرقام وشرطة فقط</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">رقم الهاتف</label>
            <input dir="ltr" placeholder="07XXXXXXXX" required value={form.phone} onChange={(e) => upd("phone", e.target.value)} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 outline-none text-left" />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">البريد الإلكتروني</label>
            <input dir="ltr" placeholder="name@example.com" type="email" required value={form.email} onChange={(e) => upd("email", e.target.value)} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 outline-none text-left" />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">كلمة المرور</label>
            <input placeholder="6 أحرف على الأقل" type="password" required value={form.password} onChange={(e) => upd("password", e.target.value)} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 outline-none" />
          </div>

          <button disabled={loading} className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-black focus:ring-4 focus:ring-zinc-900/20 disabled:opacity-50 transition shadow-sm">{loading ? "جاري الإنشاء..." : "أنشئ متجري — مجاناً مدى الحياة"}</button>
          <p className="text-center text-xs text-zinc-600 font-medium">بعد الإنشاء رابطك المجاني: <span className="font-mono text-zinc-900" dir="ltr">{process.env.NEXT_PUBLIC_BASE_DOMAIN || "coddz.com"}/{form.subdomain || "mystore"}/p/SLUG</span> — يعمل مباشرة بدون نطاق مدفوع</p>
          <p className="text-center text-sm text-zinc-700">لديك حساب؟ <Link href="/login" className="text-zinc-900 font-bold underline decoration-2 underline-offset-4">سجل الدخول</Link></p>
        </form>
      </div>
    </div>
  );
}
