import Link from "next/link";

const plans = [
  { name: "مجاني", price: "0 دج", period: "مدى الحياة", features: ["متاجر غير محدودة", "منتجات غير محدودة", "طلبات غير محدودة", "رابط مجاني: متجرك/p/منتج", "شحن Yalidine (بحسابك)", "بدون نطاق مدفوع"], cta: "ابدأ مجاناً الآن", href: "/register", highlight: true },
  { name: "احترافي", price: "0 دج", period: "اختياري مستقبلاً", features: ["كل مميزات المجاني", "نطاق مخصص coddz.com (عند شرائه)", "دعم أولوية", "تقارير متقدمة"], cta: "مجاني حالياً", href: "/register", highlight: false },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-extrabold text-zinc-900">COD DZ</Link>
          <Link href="/login" className="text-sm border-2 border-zinc-300 px-5 py-2 rounded-full font-bold text-zinc-900 hover:bg-zinc-50">دخول</Link>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex bg-zinc-900 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3">مجاني 100% — بدون نطاق مدفوع</div>
          <h1 className="text-4xl font-black text-zinc-900">يعمل مجاناً بالكامل</h1>
          <p className="text-zinc-700 mt-3 font-medium">أنشئ متجرك الآن برابط حقيقي يشتغل فوراً: <span className="font-mono text-zinc-900" dir="ltr">{process.env.NEXT_PUBLIC_BASE_DOMAIN || "coddz.com"}/متجرك/p/منتج</span> — لا حاجة لشراء نطاق.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-3xl p-8 border-2 ${p.highlight ? "border-zinc-900 shadow-xl bg-zinc-900 text-white" : "border-zinc-200 bg-white"}`}>
              {p.highlight && <div className="bg-white text-zinc-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">موصى به — مجاني</div>}
              <h3 className={`font-extrabold text-lg ${p.highlight ? "text-white" : "text-zinc-900"}`}>{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black">{p.price}</span>
                <span className={`${p.highlight ? "text-zinc-300" : "text-zinc-600"} font-bold`}>{p.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm font-medium">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className={`${p.highlight ? "text-white" : "text-zinc-900"} font-bold`}>✓</span> <span className={p.highlight ? "text-zinc-100" : "text-zinc-700"}>{f}</span></li>
                ))}
              </ul>
              <Link href={p.href} className={`mt-8 block text-center py-3.5 rounded-xl font-bold transition ${p.highlight ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-black"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-zinc-50 rounded-2xl border-2 border-zinc-200 p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-extrabold text-zinc-900">كيف يعمل مجاناً؟</h4>
            <p className="text-sm text-zinc-700 mt-2 leading-6 font-medium">المنصة على Vercel Hobby + Supabase Free — مجانية. لا نأخذ عمولة. كل تاجر يدفع لـ Yalidine مباشرة فقط عند الشحن. الرابط المجاني `vercel.app` يشتغل كأي موقع حقيقي وتشاركه مع زبائنك.</p>
          </div>
          <div>
            <h4 className="font-extrabold text-zinc-900">متى تحتاج نطاق؟</h4>
            <p className="text-sm text-zinc-700 mt-2 leading-6 font-medium">اختياري فقط للماركة. يمكنك البقاء مجاناً للأبد على الرابط المجاني، أو لاحقاً شراء `coddz.com` وربط Wildcard — الكود جاهز.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
