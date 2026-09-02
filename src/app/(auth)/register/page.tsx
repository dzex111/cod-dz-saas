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
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">C</div>
            <span className="font-extrabold text-xl text-foreground">COD DZ</span>
          </Link>
          <p className="text-sm font-bold text-emerald-600 mt-2">✓ مجاني 100%</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-7">
          <h1 className="text-2xl font-extrabold text-foreground text-center mb-5">أنشئ متجرك الآن</h1>

          {err && <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-xl text-sm font-medium mb-5">{err}</div>}

          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-muted-soft mb-1.5">اسم النشاط</label>
              <input placeholder="مثال: متجر الأناقة" required value={form.business_name} onChange={(e) => upd("business_name", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground placeholder:text-muted-soft focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-soft mb-1.5">النطاق الفرعي</label>
              <div className="flex rounded-xl border border-border focus-within:border-primary overflow-hidden bg-card">
                <input placeholder="mystore" required value={form.subdomain} onChange={(e) => upd("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="flex-1 px-4 py-3 bg-card text-foreground placeholder:text-muted-soft outline-none text-left" dir="ltr" />
                <span className="px-3 py-3 bg-primary/10 text-primary-soft text-sm font-mono border-l-2 border-primary" dir="ltr">.coddz.com</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-soft mb-1.5">رقم الهاتف</label>
              <input dir="ltr" placeholder="07XXXXXXXX" required value={form.phone} onChange={(e) => upd("phone", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground placeholder:text-muted-soft focus:border-primary outline-none text-left" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-soft mb-1.5">البريد الإلكتروني</label>
              <input dir="ltr" placeholder="name@example.com" type="email" required value={form.email} onChange={(e) => upd("email", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground placeholder:text-muted-soft focus:border-primary outline-none text-left" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-soft mb-1.5">كلمة المرور</label>
              <input placeholder="8 أحرف على الأقل" type="password" required value={form.password} onChange={(e) => upd("password", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground placeholder:text-muted-soft focus:border-primary outline-none" />
            </div>
            <button disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark disabled:opacity-50 transition">
              {loading ? "جاري الإنشاء..." : "أنشئ متجرك — مجاناً"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-soft mt-4">لديك حساب؟ <Link href="/login" className="color-primary font-bold hover:underline">سجل الدخول</Link></p>
        <p className="text-center text-xs text-muted-soft mt-2"><Link href="/" className="hover:text-muted-600">← الرئيسية</Link></p>
      </div>
    </div>
  );
}