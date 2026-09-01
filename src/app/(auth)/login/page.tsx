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
      const msg = error.message.includes("Email not confirmed") ? "البريد غير مؤكد — تم تعطيل التأكيد الآن، حاول مرة أخرى أو سجل بحساب جديد" : error.message.includes("Invalid login") ? "بيانات الدخول غير صحيحة" : error.message;
      setErr(msg);
    } else {
      // توجيه الأدمن مباشرة للوحة الأدمن، والتاجر للوحة التحكم
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s=>s.trim().toLowerCase());
      const isAdmin = adminEmails.includes(email.toLowerCase().trim());
      router.push(isAdmin ? "/admin/subscriptions" : "/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold text-lg">C</div>
            <span className="font-extrabold text-xl text-zinc-900">COD DZ</span>
          </Link>
          <p className="text-sm text-zinc-600 mt-2">منصة الدفع عند الاستلام للجزائر</p>
        </div>

        <form onSubmit={handle} className="bg-white rounded-2xl border-2 border-zinc-200 shadow-sm p-7 space-y-5">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 text-center">تسجيل الدخول</h1>
            <p className="text-sm text-zinc-600 text-center mt-1">أدخل بياناتك للوصول للوحة التحكم</p>
          </div>

          {err && <div className="bg-red-50 border-2 border-red-200 text-red-900 p-3 rounded-xl text-sm font-medium">{err}</div>}

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">البريد الإلكتروني</label>
            <input dir="ltr" placeholder="name@example.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 outline-none transition text-[15px]" />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">كلمة المرور</label>
            <input placeholder="••••••••" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 outline-none transition text-[15px]" />
          </div>

          <button disabled={loading} className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-black focus:ring-4 focus:ring-zinc-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">{loading ? "جاري الدخول..." : "دخول إلى لوحة التحكم"}</button>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs leading-5">
            <div className="font-bold text-zinc-900">حساب تجريبي جاهز:</div>
            <div className="text-zinc-700 font-mono" dir="ltr">test10614@coddz.com / Test123456!</div>
          </div>

          <p className="text-center text-sm text-zinc-700">ليس لديك حساب؟ <Link href="/register" className="text-zinc-900 font-bold underline decoration-2 underline-offset-4 hover:text-black">أنشئ متجراً مجاناً</Link></p>
          <p className="text-center text-xs"><Link href="/" className="text-zinc-600 hover:text-zinc-900 underline">← العودة للرئيسية</Link></p>
        </form>
      </div>
    </div>
  );
}
