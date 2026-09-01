"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.includes("Email not confirmed")
        ? "البريد غير مؤكد — تم تعطيل التأكيد الآن، حاول مرة أخرى أو سجل بحساب جديد"
        : error.message.includes("Invalid login")
        ? "بيانات الدخول غير صحيحة"
        : error.message;
      setErr(msg);
    } else {
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase());
      const isAdmin = adminEmails.includes(email.toLowerCase().trim());
      router.push(isAdmin ? "/admin/subscriptions" : "/dashboard");
      router.refresh();
    }
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
            أدر متجرك<br />
            <span className="text-blue-400">بنقرة واحدة</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-md">
            منصة احترافية لإدارة متاجر الدفع عند الاستلام في الجزائر — ربط Yalidine، إدارة الطلبات، واكتشاف الطلبات الوهمية.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold">58</div>
              <div className="text-gray-400 text-sm">ولاية</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-gray-400 text-sm">مجاني</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-gray-400 text-sm">دعم</div>
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
              <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
              <p className="text-gray-500 mt-2">أدخل بياناتك للوصول للوحة التحكم</p>
            </div>

            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium mb-6">
                {err}
              </div>
            )}

            <form onSubmit={handle} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  dir="ltr"
                  placeholder="name@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-[15px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
                <input
                  placeholder="••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-[15px]"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-[15px] hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري الدخول...
                  </span>
                ) : "دخول إلى لوحة التحكم"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-xs font-semibold text-gray-700 mb-1">حساب تجريبي:</div>
              <div className="text-sm text-gray-600 font-mono" dir="ltr">test10614@coddz.com / kikou@2007</div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="text-gray-900 font-semibold hover:underline">
                  أنشئ متجرك مجاناً
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
