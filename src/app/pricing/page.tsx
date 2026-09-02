import Link from "next/link";

const plans = [
  { name: "مجاني", price: "0 دج", period: "مدى الحياة", features: ["متاجر غير محدودة", "منتجات غير محدودة", "طلبات غير محدودة", "رابط مجاني: yourstore.coddz.com", "شحن Yalidine (بحسابك)"], cta: "ابدأ مجاناً", href: "/register", highlight: true },
  { name: "احترافي", price: "0 دج", period: "اختياري مستقبلاً", features: ["كل مميزات المجاني", "نطاق مخصص coddz.com", "دعم أولوية", "تقارير متقدمة"], cta: "مجاني حالياً", href: "/register", highlight: false },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-extrabold text-foreground text-lg">COD DZ</Link>
          <Link href="/login" className="text-sm border border-border px-5 py-2 rounded-full font-bold text-foreground hover:bg-border transition">دخول</Link>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3">مجاني 100%</div>
          <h1 className="text-4xl font-extrabold text-foreground">يعمل مجاناً بالكامل</h1>
          <p className="text-muted-soft mt-3 font-medium">أنشئ متجرك الآن برابط حقيقي يشتغل فوراً — لا حاجة لشراء نطاق.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className="bg-card rounded-2xl p-8 border border-border hover:shadow-xl transition-group">
              {p.highlight && <div className="bg-card-hover text-primary font-bold text-xs px-3 py-1 rounded-full inline-block mb-3">موصى به</div>}
              <h3 className={`font-extrabold text-lg ${p.highlight ? "text-primary" : "text-foreground"}`}>{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black">{p.price}</span>
                <span className={p.highlight ? "text-muted-soft" : "text-muted-soft"} font-bold>{p.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm font-medium">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="font-bold">✓</span> <span className="text-muted-soft">{f}</span></li>
                ))}
              </ul>
              <Link href={p.href} className={`mt-8 block text-center py-3 rounded-xl font-bold transition ${p.highlight ? "bg-card text-primary border border-primary hover:bg-primary/5" : "bg-primary text-white hover:bg-primary-dark"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}