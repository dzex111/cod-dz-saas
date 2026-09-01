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
    if (!/^(05|06|07)[0-9]{8}$/.test(form.phone.replace(/[^0-9]/g, ""))) {
      setErr("رقم الهاتف يجب أن يبدأ بـ 05/06/07 ويحتوي 10 أرقام");
      setLoading(false); return;
    }

    const { data: signUpData, error: signError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (signError) { setErr(signError.message); setLoading(false); return; }
    const user = signUpData.user;
    if (!user) { setErr("تم إنشاء الحساب — سجل الدخول الآن"); router.push("/login"); setLoading(false); return; }

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
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
              <span className="text-gray-900 font-bold text-xl">C</span>
            </div>
            <span className="font-bold text-2xl">COD DZ</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            أنشئ متجرك<br />
            <span className="text-emerald-400">مجاناً في دقائق</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-md">
            احصل على متجرك الخاص مع نطاق فرعي مجاني، ربط الشحن، ولوحة تحكم احترافية — كل ذلك بدون تكلفة.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-gray-300">رابط مجاني: yourstore.coddz.com</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-gray-300">شحن Yalidine مدمج</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-gray-300">كشف الطلبات الوهمية تلقائياً</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl text-gray-900">COD DZ</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                مجاني 100% — بدون بطاقة
              </div>
              <h1 className="text-2xl font-bold text-gray-900">أنشئ متجرك الآن</h1>
              <p className="text-gray-500 mt-2">سجّل وابدأ البيع في دقائق</p>
            </div>

            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium mb-6">
                {err}
              </div>
            )}

            <form onSubmit={handle} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم النشاط التجاري</label>
                <input
                  placeholder="مثال: متجر الأناقة"
                  required
                  value={form.business_name}
                  onChange={(e) => upd("business_name", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">النطاق الفرعي</label>
                <div className="flex rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 overflow-hidden bg-gray-50 focus-within:bg-white transition">
                  <input
                    placeholder="mystore"
                    required
                    value={form.subdomain}
                    onChange={(e) => upd("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 px-4 py-3 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none text-left"
                    dir="ltr"
                  />
                  <span className="px-4 py-3 bg-gray-100 text-gray-500 text-sm font-mono border-l border-gray-200" dir="ltr">.coddz.com</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">أحرف إنجليزية صغيرة وأرقام وشرطة فقط</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
                <input
                  dir="ltr"
                  placeholder="07XXXXXXXX"
                  required
                  value={form.phone}
                  onChange={(e) => upd("phone", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-left"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  dir="ltr"
                  placeholder="name@example.com"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => upd("email", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-left"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
                <input
                  placeholder="8 أحرف على الأقل"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => upd("password", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/20 disabled:opacity-50 transition shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري الإنشاء...
                  </span>
                ) : "أنشئ متجرك — مجاناً"}
              </button>

              <p className="text-center text-xs text-gray-500">
                بعد الإنشاء: <span className="font-mono text-gray-700" dir="ltr">{process.env.NEXT_PUBLIC_BASE_DOMAIN || "coddz.com"}/{form.subdomain || "mystore"}/p/SLUG</span>
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                لديك حساب؟{" "}
                <Link href="/login" className="text-gray-900 font-semibold hover:underline">
                  سجل الدخول
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">
              ← العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
