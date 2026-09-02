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
      setErr("النطاق الفرعي: 3-30 حرف إنجليزي/أرقام/شرطة");
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
      body: JSON.stringify({ business_name: form.business_name, subdomain: form.subdomain.toLowerCase(), phone: form.phone.replace(/[^0-9]/g, "") }),
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || "فشل إنشاء المتجر"); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">O</div>
            <span className="font-bold text-xl tracking-tight text-ink">ORDELY</span>
            <span className="text-[10px] font-semibold tracking-widest border border-border px-2 py-1 rounded">COD Operations</span>
          </Link>
          <p className="text-xs text-muted mt-2">Every order, under control.</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-7">
          <h1 className="text-xl font-bold text-center">Create your store</h1>
          <p className="text-sm text-muted text-center mt-1">Free onboarding for selected stores</p>

          {err && <div className="mt-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 p-3 rounded-xl text-sm font-medium">{err}</div>}

          <form onSubmit={handle} className="mt-6 space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">اسم النشاط</label>
              <input placeholder="مثال: متجر الأناقة" required value={form.business_name} onChange={(e) => upd("business_name", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">النطاق الفرعي</label>
              <div className="flex rounded-xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 overflow-hidden bg-background transition">
                <input placeholder="mystore" required value={form.subdomain} onChange={(e) => upd("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="flex-1 px-4 py-3 bg-transparent text-foreground placeholder:text-muted-soft outline-none text-left" dir="ltr" />
                <span className="px-3.5 py-3 bg-card-hover text-muted text-sm font-mono font-semibold border-s border-border flex items-center" dir="ltr">.cod-dz-saas.vercel.app</span>
              </div>
              <p className="text-xs text-muted-soft mt-1">3-30 حرف، أحرف صغيرة وأرقام فقط</p>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">رقم الهاتف</label>
              <input dir="ltr" placeholder="07XXXXXXXX" required value={form.phone} onChange={(e) => upd("phone", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-left" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">البريد الإلكتروني</label>
              <input dir="ltr" placeholder="name@example.com" type="email" required value={form.email} onChange={(e) => upd("email", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-left" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5">كلمة المرور</label>
              <input placeholder="8 أحرف على الأقل" type="password" required value={form.password} onChange={(e) => upd("password", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition" />
            </div>
            <button disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors">
              {loading ? "Creating..." : "Create store — Start free"}
            </button>
            <p className="text-center text-xs text-muted-soft">No card required • 14-day trial</p>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-4">لديك حساب؟ <Link href="/login" className="font-bold text-primary hover:underline">سجل الدخول</Link></p>
        <p className="text-center text-xs text-muted-soft mt-2"><Link href="/" className="hover:text-muted">← الرئيسية</Link></p>
      </div>
    </div>
  );
}
