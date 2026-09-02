import Link from "next/link";
import { IconShield, IconTruck, IconStore } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center text-white font-black text-[15px] shadow-sm">C</div>
            <span className="font-black text-[19px] tracking-tight text-foreground">COD DZ</span>
            <span className="hidden sm:inline-flex ml-2 text-[11px] font-bold tracking-widest bg-primary-light text-primary px-2.5 py-1 rounded-full border border-primary/10">Algérie</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-muted">
            <Link href="/pricing" className="hover:text-foreground transition-colors">الأسعار</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">المميزات</Link>
            <a href="#how" className="hover:text-foreground transition-colors">كيف تعمل</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-flex px-5 py-2 rounded-full border border-border text-[13.5px] font-bold text-foreground hover:bg-card-hover hover:border-border-strong transition-colors">دخول</Link>
            <Link href="/register" className="px-5 py-2.5 rounded-full bg-primary text-white text-[13.5px] font-bold hover:bg-primary-hover transition-colors shadow-sm">ابدأ مجاناً</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* subtle grid + gradient */}
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]" style={{ backgroundImage: `linear-gradient(to right, #0F172A 1px, transparent 1px), linear-gradient(to bottom, #0F172A 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute -top-32 right-1/2 translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-foreground">58 ولاية — توصيل Yalidine & ZR Express</span>
              <span className="hidden sm:inline text-muted-soft">• مجاني 100%</span>
            </div>

            <h1 className="mt-6 text-[38px] md:text-[52px] font-black leading-[0.95] tracking-tight">
              <span className="text-foreground">منصة إدارة</span>
              <br />
              <span className="text-primary">الدفع عند الاستلام</span>
              <br />
              <span className="text-foreground">في الجزائر</span>
            </h1>

            <p className="mt-5 text-[17px] leading-7 text-muted max-w-[560px]">
              أنشئ متجرك في دقيقة، اربط <span className="font-bold text-foreground">Yalidine</span> بضغطة، واستقبل الطلبات مع <span className="font-bold text-foreground">كشف الطلبات الوهمية</span> تلقائياً — لوحة واحدة لكل شيء.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="px-7 py-3.5 rounded-full bg-ink text-white font-bold hover:bg-ink-hover transition-colors shadow-lg text-[15px]">ابدأ الآن — مجاناً →</Link>
              <Link href="/pricing" className="px-7 py-3.5 rounded-full bg-card border border-border font-bold text-foreground hover:bg-card-hover transition-colors shadow-sm text-[15px]">شاهد الأسعار</Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-5 text-[13px] font-semibold text-muted">
              <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]">✓</span> 14 يوم تجربة</span>
              <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]">✓</span> بدون بطاقة</span>
              <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]">✓</span> إلغاء فوري</span>
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs font-medium text-muted-soft">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 border-2 border-card" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-card" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-card" />
              </div>
              <span>يثق بنا عشرات التجار في 58 ولاية</span>
            </div>
          </div>

          {/* Mock Dashboard Card — premium */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-indigo-500/5 rounded-[32px] blur-2xl" />
            <div className="relative bg-card rounded-[24px] border border-border shadow-xl overflow-hidden">
              {/* toolbar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card-hover/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-mono font-semibold text-muted-soft">dashboard • COD DZ</span>
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-500 text-white">Live</span>
              </div>

              {/* order rows — FIXED CONTRAST */}
              <div className="p-4 space-y-3 bg-card">
                <div className="rounded-2xl border border-border bg-card p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-bold text-sm text-foreground">محمد — 07XXXXXXXX</div>
                    <div className="text-xs text-muted mt-0.5">وهران • 3,500 دج • اليوم 11:24</div>
                  </div>
                  <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">قيد الانتظار</span>
                </div>
                <div className="rounded-2xl border border-border bg-card-hover p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-foreground">أحمد — 06XXXXXXXX</div>
                    <div className="text-xs text-muted mt-0.5">قسنطينة • تم الكشف تلقائياً</div>
                  </div>
                  <span className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20 px-3 py-1 rounded-full text-xs font-bold">وهمي</span>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-bold text-sm text-foreground">سارة — 05XXXXXXXX</div>
                    <div className="text-xs text-muted mt-0.5">الجزائر • Yalidine #TRK-8421</div>
                  </div>
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">تم الشحن</span>
                </div>
              </div>

              {/* stats */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-card-hover/50 border-t border-border">
                <div className="bg-card rounded-2xl p-3 text-center border border-border shadow-sm">
                  <div className="text-[22px] font-black text-foreground">1,248</div>
                  <div className="text-[11px] font-bold tracking-widest text-muted-soft uppercase">طلب</div>
                </div>
                <div className="bg-card rounded-2xl p-3 text-center border border-border shadow-sm">
                  <div className="text-[22px] font-black text-emerald-600">94%</div>
                  <div className="text-[11px] font-bold tracking-widest text-muted-soft uppercase">تأكيد</div>
                </div>
                <div className="bg-card rounded-2xl p-3 text-center border border-border shadow-sm">
                  <div className="text-[22px] font-black text-foreground">58</div>
                  <div className="text-[11px] font-bold tracking-widest text-muted-soft uppercase">ولاية</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="text-xs font-bold tracking-widest text-primary uppercase">لماذا COD DZ</div>
            <h2 className="mt-2 text-[30px] font-black tracking-tight text-foreground">كل ما تحتاجه لتبيع بنجاح</h2>
            <p className="mt-2 text-muted leading-6">أدوات احترافية مصممة لواقع التجارة الجزائرية — سريعة، آمنة، ومجانية للبداية.</p>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {[
              { t: "نطاقات فرعية لكل تاجر", d: "متجرك الخاص yourstore.cod-dz-saas.vercel.app مع صفحة هبوط فائقة السرعة.", icon: IconStore },
              { t: "شحن Yalidine & ZR مدمج", d: "اربط مفاتيحك واضغط زراً واحداً — تتبع و PDF بوليصة تلقائياً.", icon: IconTruck },
              { t: "كشف الطلبات الوهمية", d: "قائمة سوداء + كشف التكرار 24 ساعة + تنبيهات فورية.", icon: IconShield },
              { t: "دفع مرن", d: "Chargily Pay تلقائي + BaridiMob يدوي مع مراجعة أدمن سريعة.", icon: IconShield },
              { t: "عزل آمن 100%", d: "Row Level Security على مستوى قاعدة البيانات — لا تسريب أبداً.", icon: IconShield },
              { t: "58 ولاية جزائرية", d: "نموذج طلب محلي مع تحقق رقم هاتف 05/06/07 فوري.", icon: IconStore },
            ].map((f) => (
              <div key={f.t} className="group rounded-[20px] border border-border bg-background p-6 hover:bg-card hover:shadow-lg hover:border-border-strong transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><f.icon className="w-5 h-5" /></div>
                <h3 className="mt-4 font-bold text-foreground">{f.t}</h3>
                <p className="mt-1.5 text-[13.5px] leading-6 text-muted">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 bg-background border-t border-border">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-3 text-center mb-2">
            <h2 className="text-2xl font-black">كيف تعمل؟ 3 خطوات فقط</h2>
            <p className="text-muted mt-1">من التسجيل إلى أول شحنة في أقل من 5 دقائق.</p>
          </div>
          {[
            { n: "1", t: "أنشئ متجرك", d: "سجل، اختر subdomain، وأضف منتجك الأول." },
            { n: "2", t: "شارك الرابط", d: "صفحة هبوط جاهزة تستقبل الطلبات 24/7." },
            { n: "3", t: "اشحن تلقائياً", d: "أكد الطلب واضغط Yalidine — التتبع يصل للزبون." },
          ].map((s) => (
            <div key={s.n} className="rounded-[20px] bg-card border border-border p-6 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-black flex items-center justify-center mx-auto">{s.n}</div>
              <h3 className="mt-3 font-bold">{s.t}</h3>
              <p className="text-sm text-muted mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-[24px] bg-ink text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-2xl font-black">جاهز للانطلاق؟</h3>
              <p className="text-white/70 mt-1">أنشئ متجرك مجاناً الآن — بدون بطاقة، بدون تعقيد.</p>
            </div>
            <Link href="/register" className="px-7 py-3.5 rounded-full bg-white text-ink font-bold hover:bg-zinc-100 transition-colors shadow-sm">ابدأ مجاناً →</Link>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
          <div className="font-semibold text-foreground">© 2026 COD DZ — منصة جزائرية</div>
          <div className="text-muted-soft flex gap-4">
            <Link href="/pricing" className="hover:text-foreground">الأسعار</Link>
            <Link href="/login" className="hover:text-foreground">دخول</Link>
            <span className="hidden sm:inline">Next.js + Supabase • مجاني للبداية</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
