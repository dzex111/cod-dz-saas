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
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link href="/pricing" className="hover:text-zinc-900 transition">الأسعار</Link>
            <Link href="#features" className="hover:text-zinc-900 transition">المميزات</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="px-5 py-2 rounded-full border-2 border-zinc-300 text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition">دخول</Link>
            <Link href="/register" className="px-5 py-2 rounded-full bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition">ابدأ مجاناً</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-6">مصمم للسوق الجزائري — 58 ولاية</div>
          <h1 className="text-4xl md:text-5xl font-black leading-[1.1] text-zinc-900">
            منصة إدارة<br />
            <span className="text-zinc-900">الدفع عند الاستلام</span>
            <br /><span className="text-zinc-500">في الجزائر</span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
            أنشئ متجرك، اربط <span className="font-bold text-zinc-900">Yalidine</span>، استقبل الطلبات، واكتشف الطلبات الوهمية تلقائياً — كل شيء من لوحة واحدة.
          </p>
          <div className="mt-7 flex gap-3">
            <Link href="/register" className="px-7 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition">ابدأ الآن — مجاناً</Link>
            <Link href="/pricing" className="px-7 py-3 rounded-xl border-2 border-zinc-300 font-bold text-zinc-700 hover:bg-zinc-50 transition">شاهد الأسعار</Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-6 text-sm font-bold text-zinc-600">
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">✓</span> 14 يوم تجربة</span>
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">✓</span> بدون بطاقة</span>
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">✓</span> إلغاء في أي وقت</span>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-3xl p-6 text-white">
          <div className="text-sm font-bold text-zinc-400 mb-4">لوحة الطلبات — عرض حي</div>
          <div className="space-y-3">
            <div className="bg-white text-zinc-900 rounded-xl p-4 flex justify-between items-center">
              <div><div className="font-bold">محمد — 07XXXXXXXX</div><div className="text-xs text-zinc-500">وهران • 3500 دج</div></div>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">قيد الانتظار</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center border border-white/10">
              <div><div className="font-bold text-white">أحمد — بلاك ليست</div><div className="text-xs text-zinc-400">قسنطينة • تم الحجب تلقائياً</div></div>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">وهمي</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center border border-white/10">
              <div><div className="font-bold text-white">سارة — 05XXXXXXXX</div><div className="text-xs text-zinc-400">الجزائر • شحن Yalidine</div></div>
              <span className="bg-white text-zinc-900 px-3 py-1 rounded-full text-xs font-bold">تم الشحن</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10"><div className="text-2xl font-bold text-white">1,248</div><div className="text-xs text-zinc-400">طلب</div></div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10"><div className="text-2xl font-bold text-white">94%</div><div className="text-xs text-zinc-400">تأكيد</div></div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10"><div className="text-2xl font-bold text-white">58</div><div className="text-xs text-zinc-400">ولاية</div></div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-zinc-50 py-20 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-900">كل ما تحتاجه لتبيع بنجاح</h2>
            <p className="text-zinc-600 mt-2">أدوات احترافية مصممة لواقع التجارة في الجزائر — مجانية</p>
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
            <div key={f.t} className="bg-white rounded-2xl p-6 border border-zinc-200 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-3"><f.icon className="w-5 h-5" /></div>
              <h3 className="font-bold text-zinc-900 mb-1">{f.t}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{f.d}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-zinc-500 border-t border-zinc-200">
        © 2026 COD DZ — جميع الحقوق محفوظة • يعمل على Next.js + Supabase
      </footer>
    </div>
  );
}
