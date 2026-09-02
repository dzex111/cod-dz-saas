import Link from "next/link";
import { IconShield, IconTruck, IconStore } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">C</div>
            <span className="font-extrabold text-xl text-foreground tracking-tight">COD DZ</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            <Link href="/pricing" className="hover:color-primary transition">الأسعار</Link>
            <Link href="#features" className="hover:color-primary transition">المميزات</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="px-5 py-2 rounded-full border-2 border-border text-sm font-bold text-foreground hover:bg-border transition">دخول</Link>
            <Link href="/register" className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition">ابدأ مجاناً</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold mb-6">مصمم للسوق الجزائري — 58 ولاية</div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] text-foreground mb-4">
            منصة إدارة<br />
            <span className="text-primary">الدفع عند الاستلام</span>
            <br /><span className="text-muted-soft">في الجزائر</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted mb-8">
            أنشئ متجرك، اربط <span className="font-bold text-foreground">Yalidine</span>، استقبل الطلبات، واكتشف الطلبات الوهمية تلقائياً — كل شيء من لوحة واحدة.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/register" className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition">ابدأ الآن — مجاناً</Link>
            <Link href="/pricing" className="px-8 py-3 rounded-xl border-2 border-border font-bold text-primary-hover hover:bg-border transition">شاهد الأسعار</Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-bold text-muted">
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">✓</span> 14 يوم تجربة</span>
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">✓</span> بدون بطاقة</span>
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">✓</span> إلغاء في أي وقت</span>
          </div>
        </div>
        <div className="relative">
          <div className="bg-card rounded-2xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-70"></div>
            <div className="space-y-3">
              <div className="bg-card-hover rounded-xl p-4 flex justify-between items-center border border-border">
                <div>
                  <div className="font-bold">محمد — 07XXXXXXXX</div>
                  <div className="text-xs text-muted-soft">وهران • 3500 دج</div>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">قيد الانتظار</span>
              </div>
              <div className="bg-card-hover/10 rounded-xl p-4 flex justify-between items-center border border-border/30">
                <div>
                  <div className="font-bold text-white">أحمد — xx-xx-xxxx</div>
                  <div className="text-xs text-muted-soft">قسنطينة • تم الحجب تلقائياً</div>
                </div>
                <span className="bg-red-500/70 text-white px-3 py-1 rounded-full text-xs font-bold">وهمي</span>
              </div>
              <div className="bg-card-hover/10 rounded-xl p-4 flex justify-between items-center border border-border/30">
                <div>
                  <div className="font-bold text-white">سارة — 05XXXXXXXX</div>
                  <div className="text-xs text-muted-soft">الجزائر • شحن Yalidine</div>
                </div>
                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">تم الشحن</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="bg-card/20 rounded-xl p-3 border border-border/20"><div className="text-3xl font-bold text-primary">1,248</div><div className="text-xs text-muted-soft">طلب</div></div>
              <div className="bg-card/20 rounded-xl p-3 border border-border/20"><div className="text-3xl font-bold text-primary">94%</div><div className="text-xs text-muted-soft">تأكيد</div></div>
              <div className="bg-card/20 rounded-xl p-3 border border-border/20"><div className="text-3xl font-bold text-primary">58</div><div className="text-xs text-muted-soft">ولاية</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-foreground mb-3">كل ما تحتاجه لتبيع بنجاح</h2>
            <p className="text-muted-soft mt-2">أدوات احترافية مصممة لواقع التجارة في الجزائر</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "نطاقات فرعية لكل تاجر", d: "كل تاجر يحصل على متجره الخاص sub.coddz.com مع صفحة هبوط سريعة", icon: IconStore },
            { t: "شحن Yalidine مدمج", d: "اربط مفاتيحك واضغط زراً واحداً لإرسال الطلبات", icon: IconTruck },
            { t: "كشف الطلبات الوهمية", d: "قائمة سوداء + كشف التكرار خلال 24 ساعة تلقائياً", icon: IconShield },
            { t: "دفع مرن", d: "Chargily Pay تلقائي + BaridiMob يدوي مع مراجعة الأدمن", icon: IconShield },
            { t: "عزل آمن 100%", d: "Row Level Security على مستوى قاعدة البيانات — لا تسريب", icon: IconShield },
            { t: "58 ولاية جزائرية", d: "نموذج طلب مُحسّن للزبون الجزائري مع تحقق رقم الهاتف", icon: IconStore },
          ].map((f) => (
            <div key={f.t} className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl transition-group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3"><f.icon className="w-5 h-5" /></div>
              <h3 className="font-bold text-foreground mb-1">{f.t}</h3>
              <p className="text-sm leading-relaxed text-muted-soft">{f.d}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 text-center text-muted">
          © 2026 COD DZ — جميع الحقوق محفوظة • منصة احترافية تعمل على Next.js + Supabase
        </div>
      </footer>
    </div>
  );
}