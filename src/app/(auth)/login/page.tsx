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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">O</div>
            <span className="font-bold text-xl tracking-tight text-ink">ORDELY</span>
            <span className="text-[10px] font-semibold tracking-widest border border-border px-2 py-1 rounded">COD Operations</span>
          </Link>
          <p className="text-sm text-muted mt-2">Welcome back — sign in to continue</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-7">
          <h1 className="text-xl font-bold">Sign in</h1>
          <p className="text-sm text-muted mt-1">Access your Ordely workspace</p>

          {err && (
            <div className="mt-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 p-3 rounded-xl text-sm font-medium">
              {err}
            </div>
          )}

          <form onSubmit={handle} className="mt-6 space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">البريد الإلكتروني</label>
              <input dir="ltr" placeholder="name@example.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">كلمة المرور</label>
              <input placeholder="••••••••" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition" />
            </div>
            <button disabled={loading} className="w-full bg-ink text-white py-3.5 rounded-xl font-bold hover:bg-ink-hover disabled:opacity-50 transition-colors shadow-sm">
              {loading ? "جاري الدخول..." : "دخول"}
            </button>
          </form>

          <div className="mt-5 rounded-lg border border-border bg-background p-3.5">
            <div className="text-[11px] font-semibold tracking-widest text-muted-soft uppercase">Demo account</div>
            <div className="text-sm font-mono font-semibold mt-1" dir="ltr">test10614@coddz.com / kikou@2007</div>
          </div>

          <p className="text-center text-sm text-muted mt-5">
            No account? <Link href="/register" className="font-medium text-primary hover:underline">Create your store</Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-soft mt-4"><Link href="/" className="hover:text-muted">← Home</Link></p>
      </div>
    </div>
  );
}
