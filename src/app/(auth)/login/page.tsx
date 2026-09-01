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
        ? "البريد غير مؤكد — حاول مرة أخرى أو سجل بحساب جديد"
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold text-lg">C</div>
            <span className="font-extrabold text-xl text-zinc-900">COD DZ</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-7">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-zinc-900">تسجيل الدخول</h1>
            <p className="text-sm text-zinc-500 mt-1">أدخل بياناتك للوصول للوحة التحكم</p>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium mb-5">
              {err}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">البريد الإلكتروني</label>
              <input dir="ltr" placeholder="name@example.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-zinc-200 rounded-xl px-4 py-3 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">كلمة المرور</label>
              <input placeholder="••••••••" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 border-zinc-200 rounded-xl px-4 py-3 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 outline-none transition" />
            </div>
            <button disabled={loading} className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition">
              {loading ? "جاري الدخول..." : "دخول"}
            </button>
          </form>

          <div className="mt-5 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="text-xs font-bold text-zinc-600">حساب تجريبي:</div>
            <div className="text-sm text-zinc-700 font-mono" dir="ltr">test10614@coddz.com / kikou@2007</div>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-4">
          ليس لديك حساب؟ <Link href="/register" className="text-zinc-900 font-bold hover:underline">أنشئ متجرك</Link>
        </p>
        <p className="text-center text-xs text-zinc-400 mt-2"><Link href="/" className="hover:text-zinc-600">← الرئيسية</Link></p>
      </div>
    </div>
  );
}
