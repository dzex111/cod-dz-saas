import Link from "next/link";
import { IconShield, IconTruck, IconStore } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">COD DZ</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/pricing" className="hover:text-gray-900 transition">الأسعار</Link>
            <Link href="#features" className="hover:text-gray-900 transition">المميزات</Link>
            <Link href="/login" className="hover:text-gray-900 transition">الدخول</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition shadow-sm">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              مصمم للسوق الجزائري — 58 ولاية
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] text-gray-900 tracking-tight">
              منصة إدارة
              <br />
              <span className="text-blue-600">الدفع عند الاستلام</span>
              <br />
              في الجزائر
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
              أنشئ متجرك، اربط <span className="font-semibold text-gray-900">Yalidine</span>، استقبل الطلبات، واكتشف الأرقام الوهمية تلقائياً — كل شيء من لوحة واحدة.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="px-8 py-4 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20">
                ابدأ الآن — مجاناً
              </Link>
              <Link href="/pricing" className="px-8 py-4 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-white hover:border-gray-300 transition">
                شاهد الأسعار
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-8 text-sm text-gray-600">
              <span className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                14 يوم تجربة
              </span>
              <span className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                بدون بطاقة
              </span>
              <span className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                إلغاء في أي وقت
              </span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <span className="text-xs text-gray-400 font-medium">لوحة الطلبات</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">1,248</div>
                  <div className="text-xs text-gray-500 font-medium">طلب</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">94%</div>
                  <div className="text-xs text-gray-500 font-medium">تأكيد</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">58</div>
                  <div className="text-xs text-gray-500 font-medium">ولاية</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">م</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">محمد بن علي</div>
                      <div className="text-xs text-gray-500">وهران • 3,500 دج</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">قيد الانتظار</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">أ</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">أحمد — بلاك ليست</div>
                      <div className="text-xs text-gray-500">قسنطينة • تم الحجب</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">وهمي</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">س</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">سارة بن عمر</div>
                      <div className="text-xs text-gray-500">الجزائر • شحن Yalidine</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">تم الشحن</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm">المميزات</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 tracking-tight">كل ما تحتاجه لتبيع بنجاح</h2>
            <p className="text-gray-500 mt-3 text-lg">أدوات احترافية مصممة لواقع التجارة في الجزائر</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: "نطاقات فرعية لكل تاجر", d: "كل تاجر يحصل على متجره الخاص sub.coddz.com مع صفحة هبوط احترافية", icon: IconStore, color: "blue" },
              { t: "شحن Yalidine مدمج", d: "اربط مفاتيحك الخاصة واضغط زراً واحداً لإرسال الطلبات لـ 58 ولاية", icon: IconTruck, color: "emerald" },
              { t: "كشف الطلبات الوهمية", d: "قائمة سوداء + كشف التكرار خلال 24 ساعة تلقائياً — وفّر وقتك", icon: IconShield, color: "red" },
              { t: "دفع مرن", d: "Chargily Pay تلقائي بالبطاقة + BaridiMob يدوي مع مراجعة الأدمن", icon: IconShield, color: "amber" },
              { t: "عزل آمن 100%", d: "Row Level Security على مستوى قاعدة البيانات — لا تسريب بيانات أبداً", icon: IconShield, color: "purple" },
              { t: "58 ولاية جزائرية", d: "نموذج طلب مُحسّن للزبون الجزائري مع تحقق رقم الهاتف تلقائياً", icon: IconStore, color: "cyan" },
            ].map((f) => (
              <div key={f.t} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  f.color === "blue" ? "bg-blue-100 text-blue-600" :
                  f.color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                  f.color === "red" ? "bg-red-100 text-red-600" :
                  f.color === "amber" ? "bg-amber-100 text-amber-600" :
                  f.color === "purple" ? "bg-purple-100 text-purple-600" :
                  "bg-cyan-100 text-cyan-600"
                } group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.t}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">ابدأ البيع الآن — مجاناً</h2>
          <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
            لا حاجة لبطاقة ائتمان. أنشئ متجرك في دقائق وابدأ استقبال الطلبات من 58 ولاية جزائرية.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition shadow-lg">
              أنشئ متجرك الآن
            </Link>
            <Link href="/pricing" className="px-8 py-4 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:bg-gray-800 transition">
              شاهد الأسعار
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-semibold text-gray-900">COD DZ</span>
          </div>
          <p>© 2026 COD DZ — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Next.js + Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
