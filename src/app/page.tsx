import Link from "next/link";
import { IconShield, IconTruck, IconStore } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold">C</div>
            <span className="font-extrabold text-xl text-zinc-900 tracking-tight">COD DZ</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-700">
            <Link href="/pricing" className="hover:text-zinc-900 transition">الأسعار</Link>
            <Link href="#features" className="hover:text-zinc-900 transition">المميزات</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="px-5 py-2.5 rounded-full border-2 border-zinc-300 text-sm font-bold text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400 transition">تسجيل الدخول</Link>
            <Link href="/register" className="px-5 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-bold hover:bg-black transition shadow-sm">ابدأ مجاناً</Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide mb-5">مصمم للسوق الجزائري — 58 ولاية</div>
          <h1 className="text-4xl md:text-5xl font-black leading-[1.15] text-zinc-900">
            منصة إدارة<br />
            <span className="text-zinc-900">الدفع عند الاستلام</span>
            <br /><span className="text-zinc-600">في الجزائر</span>
          </h1>
          <p className="mt-5 text-[17px] text-zinc-700 leading-8 font-medium">
            أنشئ متجرك، اربط <span className="font-bold text-zinc-900">Yalidine</span>، استقبل الطلبات، اكتشف الأرقام الوهمية تلقائياً، وأدر كل شيء من لوحة واحدة. نطاقات فرعية لكل تاجر، وتجربة زبون سريعة.
          </p>
          <div className="mt-7 flex gap-3">
            <Link href="/register" className="px-7 py-3.5 rounded-xl bg-zinc-900 text-white font-bold hover:bg-black transition shadow-sm">ابدأ الآن — مجاناً</Link>
            <Link href="/pricing" className="px-7 py-3.5 rounded-xl border-2 border-zinc-300 font-bold text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400 transition">شاهد الأسعار</Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-6 text-sm font-bold text-zinc-700">
            <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg></span> 14 يوم تجربة</span>
            <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg></span> بدون بطاقة</span>
            <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg></span> إلغاء في أي وقت</span>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-[2rem] p-6 text-white relative overflow-hidden border border-zinc-800">
          <div className="text-sm font-bold text-zinc-300 mb-4 tracking-wide">لوحة الطلبات — عرض حي</div>
          <div className="space-y-3">
            <div className="bg-white text-zinc-900 rounded-xl p-4 flex justify-between items-center">
              <div><div className="font-bold">محمد — 07XXXXXXXX</div><div className="text-xs text-zinc-500">وهران • 3500 دج</div></div>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs">قيد الانتظار</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center border border-white/10">
              <div><div className="font-bold">أحمد — بلاك ليست</div><div className="text-xs text-zinc-300">قسنطينة • تم الحجب تلقائياً</div></div>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">وهمي</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center border border-white/10">
              <div><div className="font-bold">سارة — 05XXXXXXXX</div><div className="text-xs text-zinc-300">الجزائر • شحن Yalidine</div></div>
              <span className="bg-white text-zinc-900 px-3 py-1 rounded-full text-xs font-bold">تم الشحن</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10"><div className="text-2xl font-bold">1,248</div><div className="text-xs font-bold text-zinc-300">طلب</div></div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10"><div className="text-2xl font-bold">94%</div><div className="text-xs font-bold text-zinc-300">تأكيد</div></div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10"><div className="text-2xl font-bold">58</div><div className="text-xs font-bold text-zinc-300">ولاية</div></div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-zinc-50 py-20 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight text-zinc-900">كل ما تحتاجه لتبيع بنجاح</h2>
            <p className="text-zinc-700 mt-3 text-lg font-medium">أدوات احترافية مصممة لواقع التجارة في الجزائر — مجانية</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
          {[
            { t: "نطاقات فرعية لكل تاجر", d: "كل تاجر يحصل على متجره الخاص sub.coddz.com مع صفحة هبوط سريعة", icon: IconStore },
            { t: "شحن Yalidine مدمج", d: "اربط مفاتيحك الخاصة واضغط زراً واحداً لإرسال الطلبات", icon: IconTruck },
            { t: "كشف الطلبات الوهمية", d: "قائمة سوداء + كشف التكرار خلال 24 ساعة تلقائياً", icon: IconShield },
            { t: "دفع مرن", d: "Chargily Pay تلقائي + BaridiMob يدوي مع مراجعة الأدمن", icon: IconShield },
            { t: "عزل آمن 100%", d: "Row Level Security على مستوى قاعدة البيانات — لا تسريب أبداً", icon: IconShield },
            { t: "58 ولاية جزائرية", d: "نموذج طلب مُحسّن للزبون الجزائري مع تحقق رقم الهاتف", icon: IconStore },
          ].map((f) => (
            <div key={f.t} className="bg-white rounded-3xl p-7 border-2 border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-4"><f.icon className="w-6 h-6" /></div>
              <h3 className="font-black text-zinc-900 text-lg mb-2">{f.t}</h3>
              <p className="text-[15px] text-zinc-700 leading-7 font-medium">{f.d}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm font-medium text-zinc-600 border-t border-zinc-200 bg-zinc-50">
        © 2026 COD DZ — جميع الحقوق محفوظة • يعمل على Next.js + Supabase
      </footer>
    </div>
  );
}
