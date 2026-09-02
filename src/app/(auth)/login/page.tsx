"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/dashboard");
    });
  }, []);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      const msg = error.message.includes("Email not confirmed")
        ? "Email not confirmed — check your inbox or create a new account."
        : error.message.includes("Invalid login") || error.message.includes("Invalid")
        ? "Invalid email or password."
        : error.message;
      setErr(msg);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Brand */}
      <div className="hidden lg:flex lg:w-[46%] bg-ink text-white flex-col justify-between p-10">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-bold">O</div>
            <span className="font-bold tracking-tight">ORDELY</span>
            <span className="text-xs opacity-60 border border-white/20 px-2 py-0.5 rounded">COD Operations</span>
          </Link>
          <div className="mt-16 max-w-md">
            <h1 className="text-3xl font-bold leading-tight">Every order,<br />under control.</h1>
            <p className="text-white/70 mt-4 leading-relaxed">Run your COD operations from one organized workspace. Verify, track and fulfill — without the chaos.</p>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</span> Order workspace with clear status</li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</span> Duplicate & risk signals before fulfillment</li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</span> Team workflow & operational analytics</li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-white/50">© 2026 ORDELY • كل طلب تحت السيطرة</div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold">O</div>
            <span className="font-bold">ORDELY</span>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-7">
            <h1 className="text-xl font-bold">Sign in to Ordely</h1>
            <p className="text-sm text-muted mt-1">Access your workspace to manage orders.</p>

            {err && <div className="mt-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg p-3">{err}</div>}

            <form onSubmit={handle} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input autoComplete="email" dir="ltr" placeholder="you@company.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Password</label>
                  <Link href="/login" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="mt-1.5 relative">
                  <input placeholder="••••••••" type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-2 px-2 text-xs text-muted hover:text-ink">{show ? "Hide" : "Show"}</button>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 bg-subtle border border-border rounded-lg p-3">
              <div className="text-xs font-medium text-muted">Demo account</div>
              <div className="text-sm font-mono mt-1" dir="ltr">test10614@coddz.com / kikou@2007</div>
            </div>

            <p className="text-center text-sm text-muted mt-6">
              No account? <Link href="/register" className="text-primary font-medium hover:underline">Create your store</Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted mt-6"><Link href="/" className="hover:text-ink">← Back to website</Link> • <Link href="/pricing" className="hover:text-ink">Pricing</Link></p>
        </div>
      </div>
    </div>
  );
}
