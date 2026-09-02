"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ business_name: "", subdomain: "", phone: "", email: "", password: "" });
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

  function upd(k: string, v: string) { setForm({ ...form, [k]: v }); }

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    if (!/^[a-z0-9-]{3,30}$/.test(form.subdomain)) {
      setErr("Subdomain: 3–30 lowercase letters, numbers or hyphen.");
      setLoading(false); return;
    }
    if (!/^(05|06|07)[0-9]{8}$/.test(form.phone.replace(/[^0-9]/g, ""))) {
      setErr("Phone must start with 05/06/07 and contain 10 digits.");
      setLoading(false); return;
    }
    const { data: signUpData, error: signError } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password });
    if (signError) { setErr(signError.message); setLoading(false); return; }
    const user = signUpData.user;
    if (!user) { setErr("Account created — please sign in."); router.push("/login"); setLoading(false); return; }
    const res = await fetch("/api/merchant/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_name: form.business_name.trim(), subdomain: form.subdomain.toLowerCase(), phone: form.phone.replace(/[^0-9]/g, "") }),
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || "Failed to create store."); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-[46%] bg-ink text-white flex-col justify-between p-10">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-bold">O</div>
            <span className="font-bold tracking-tight">ORDELY</span>
            <span className="text-xs opacity-60 border border-white/20 px-2 py-0.5 rounded">COD Operations</span>
          </Link>
          <div className="mt-16 max-w-md">
            <h1 className="text-3xl font-bold leading-tight">Start with clarity.</h1>
            <p className="text-white/70 mt-4">Create your Ordely workspace. Invite your team, connect logistics, and run orders without chaos.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4"><div className="font-semibold">Free onboarding</div><div className="text-white/60 text-xs mt-1">Selected stores</div></div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4"><div className="font-semibold">14-day trial</div><div className="text-white/60 text-xs mt-1">No card required</div></div>
            </div>
          </div>
        </div>
        <div className="text-xs text-white/50">Trusted by operational stores</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-[480px]">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold">O</div>
            <span className="font-bold">ORDELY</span>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-7">
            <h1 className="text-xl font-bold">Create your store</h1>
            <p className="text-sm text-muted mt-1">Every order, under control — from day one.</p>

            {err && <div className="mt-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg p-3">{err}</div>}

            <form onSubmit={handle} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Business name</label>
                <input placeholder="e.g. Atlas Store" required value={form.business_name} onChange={(e) => upd("business_name", e.target.value)} className="mt-1.5 w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium">Subdomain</label>
                <div className="mt-1.5 flex rounded-lg border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 overflow-hidden bg-white">
                  <input placeholder="mystore" required value={form.subdomain} onChange={(e) => upd("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="flex-1 px-3 py-2.5 text-sm outline-none text-left" dir="ltr" />
                  <span className="px-3 py-2.5 bg-subtle text-muted text-xs font-mono border-s border-border flex items-center" dir="ltr">.cod-dz-saas.vercel.app</span>
                </div>
                <p className="text-xs text-muted mt-1">3–30 characters, lowercase, numbers, hyphen.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input dir="ltr" placeholder="07XXXXXXXX" required value={form.phone} onChange={(e) => upd("phone", e.target.value)} className="mt-1.5 w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-left" />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="mt-1.5 relative">
                    <input placeholder="At least 8 characters" type={show ? "text" : "password"} required value={form.password} onChange={(e) => upd("password", e.target.value)} className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-2 px-2 text-xs text-muted">{show ? "Hide" : "Show"}</button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Work email</label>
                <input dir="ltr" placeholder="you@company.com" type="email" required value={form.email} onChange={(e) => upd("email", e.target.value)} className="mt-1.5 w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-left" />
              </div>
              <button disabled={loading} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-50">
                {loading ? "Creating…" : "Create store"}
              </button>
              <p className="text-center text-xs text-muted">By creating you agree to our Terms • No card required</p>
            </form>
          </div>

          <p className="text-center text-sm text-muted mt-4">Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
          <p className="text-center text-xs text-muted mt-2"><Link href="/" className="hover:text-ink">← Back to website</Link></p>
        </div>
      </div>
    </div>
  );
}
