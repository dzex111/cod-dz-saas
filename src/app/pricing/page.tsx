import Link from "next/link";

const plans = [
  { name: "مجاني", price: "0 دج", period: "مدى الحياة", features: ["متاجر غير محدودة", "منتجات غير محدودة", "طلبات غير محدودة", "رابط مجاني: yourstore.coddz.com", "شحن Yalidine (بحسابك)"], cta: "ابدأ مجاناً", href: "/register", highlight: true },
  { name: "احترافي", price: "0 دج", period: "اختياري مستقبلاً", features: ["كل مميزات المجاني", "نطاق مخصص coddz.com", "دعم أولوية", "تقارير متقدمة"], cta: "مجاني حالياً", href: "/register", highlight: false },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-extrabold text-zinc-900 text-lg">COD DZ</Link>
          <Link href="/login" className="text-sm border-2 border-zinc-200 px-5 py-2 rounded-full font-bold text-zinc-700 hover:bg-zinc-50 transition">دخول</Link>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex bg-zinc-900 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3">مجاني 100%</div>
          <h1 className="text-4xl font-black text-zinc-900">يعمل مجاناً بالكامل</h1>
          <p className="text-zinc-500 mt-3 font-medium">أنشئ متجرك الآن برابط حقيقي يشتغل فوراً — لا حاجة لشراء نطاق.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl p-8 border-2 ${p.highlight ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white"}`}>
              {p.highlight && <div className="bg-white text-zinc-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">موصى به</div>}
              <h3 className={`font-extrabold text-lg ${p.highlight ? "text-white" : "text-zinc-900"}`}>{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black">{p.price}</span>
                <span className={`${p.highlight ? "text-zinc-400" : "text-zinc-500"} font-bold`}>{p.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm font-medium">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className={`${p.highlight ? "text-white" : "text-zinc-900"} font-bold`}>✓</span> <span className={p.highlight ? "text-zinc-300" : "text-zinc-600"}>{f}</span></li>
                ))}
              </ul>
              <Link href={p.href} className={`mt-8 block text-center py-3 rounded-xl font-bold transition ${p.highlight ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
