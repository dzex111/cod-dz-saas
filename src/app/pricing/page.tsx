import Link from "next/link";

const plans = [
  {
    name: "مجاني",
    price: "0 دج",
    period: "مدى الحياة",
    description: "مثالي للبداية",
    features: [
      "متاجر غير محدودة",
      "منتجات غير محدودة",
      "طلبات غير محدودة",
      "رابط مجاني: yourstore.coddz.com",
      "شحن Yalidine (بحسابك)",
      "لوحة تحكم احترافية",
    ],
    cta: "ابدأ مجاناً",
    href: "/register",
    highlight: true,
  },
  {
    name: "احترافي",
    price: "0 دج",
    period: "اختياري مستقبلاً",
    description: "للمتاجر الكبيرة",
    features: [
      "كل مميزات المجاني",
      "نطاق مخصص (coddz.com)",
      "دعم أولوية",
      "تقارير متقدمة",
      "API مخصص",
    ],
    cta: "مجاني حالياً",
    href: "/register",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">COD DZ</span>
          </Link>
          <Link href="/login" className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
            تسجيل الدخول
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            مجاني 100%
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">أسعار واضحة وبسيطة</h1>
          <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
            أنشئ متجرك الآن برابط حقيقي يشتغل فوراً — لا حاجة لشراء نطاق.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border-2 transition-all duration-300 ${
                p.highlight
                  ? "bg-gray-900 border-gray-900 text-white shadow-2xl shadow-gray-900/20"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg"
              }`}
            >
              {p.highlight && (
                <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  موصى به
                </div>
              )}
              <h3 className={`font-bold text-xl ${p.highlight ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
              <p className={`text-sm mt-1 ${p.highlight ? "text-gray-400" : "text-gray-500"}`}>{p.description}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "text-gray-400" : "text-gray-500"}`}>{p.period}</span>
              </div>
              <ul className="mt-8 space-y-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      p.highlight ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                    }`}>
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className={`text-sm ${p.highlight ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`mt-8 block text-center py-3.5 rounded-xl font-semibold transition ${
                  p.highlight
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">الأسئلة الشائعة</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">كيف يعمل مجاناً؟</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                المنصة مبنية على Vercel Hobby + Supabase Free — مجانية بالكامل. لا نأخذ عمولة. كل تاجر يدفع لـ Yalidine مباشرة فقط عند الشحن.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">متى تحتاج نطاق؟</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                اختياري فقط للماركة. يمكنك البقاء مجاناً للأبد على الرابط المجاني، أو لاحقاً شراء نطاق مخصص.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">هل أستطيع إلغاء الاشتراك؟</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                لا يوجد اشتراك مدفوع حالياً — الخدمة مجانية بالكامل. إذا أضفنا خطط مدفوعة مستقبلاً، يمكنك الإلغاء في أي وقت.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
        <p>© 2026 COD DZ — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
