import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const plans = [
  { name: "مجاني", price: "0 دج", period: "مدى الحياة", features: ["متاجر غير محدودة", "منتجات غير محدودة", "طلبات غير محدودة", "رابط مجاني yourstore.cod-dz-saas.vercel.app", "شحن Yalidine & ZR (بحسابك)", "قائمة سوداء + كشف التكرار"], cta: "ابدأ مجاناً", href: "/register", highlight: true, badge: "الأكثر شيوعاً" },
  { name: "احترافي", price: "0 دج", period: "مجاني حالياً", features: ["كل مميزات المجاني", "نطاق مخصص *.coddz.com (قريباً)", "دعم أولوية", "تقارير متقدمة", "تصدير CSV بلا حدود"], cta: "مجاني حالياً", href: "/register", highlight: false, badge: "قريباً" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-ink text-white flex items-center justify-center font-black text-sm">C</div>
            <span className="font-black text-foreground text-[17px]">COD DZ</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="text-sm border border-border px-5 py-2 rounded-full font-bold text-foreground hover:bg-card-hover transition-colors bg-card">دخول</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex bg-emerald-500 text-white px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest">مجاني 100% للبداية</div>
          <h1 className="mt-4 text-[36px] font-black tracking-tight text-foreground leading-tight">يعمل مجاناً بالكامل</h1>
          <p className="text-muted mt-3 leading-6">أنشئ متجرك الآن برابط حقيقي يشتغل فوراً — لا حاجة لشراء نطاق. ترقية اختيارية لاحقاً.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-[24px] p-7 border shadow-sm ${p.highlight ? "bg-ink text-white border-ink shadow-xl scale-[1.02]" : "bg-card border-border"}`}>
              {p.highlight && <div className="absolute -top-3 right-6 bg-primary text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm">{p.badge}</div>}
              {!p.highlight && <div className="absolute -top-3 right-6 bg-card border border-border text-muted text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">{p.badge}</div>}

              <h3 className={`font-black text-lg ${p.highlight ? "text-white" : "text-foreground"}`}>{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-[32px] font-black tracking-tight ${p.highlight ? "text-white" : "text-foreground"}`}>{p.price}</span>
                <span className={`text-sm font-bold ${p.highlight ? "text-white/60" : "text-muted-soft"}`}>{p.period}</span>
              </div>

              <ul className="mt-6 space-y-3 text-[13.5px] font-medium">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 items-start">
                    <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${p.highlight ? "bg-white/15 text-white" : "bg-emerald-500 text-white"}`}>✓</span>
                    <span className={p.highlight ? "text-white/90" : "text-muted"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={p.href} className={`mt-7 block text-center py-3.5 rounded-full font-bold transition-colors ${p.highlight ? "bg-white text-ink hover:bg-zinc-100" : "bg-ink text-white hover:bg-ink-hover"}`}>{p.cta}</Link>
              <p className={`text-center text-xs mt-3 ${p.highlight ? "text-white/50" : "text-muted-soft"}`}>بدون بطاقة • تفعيل فوري</p>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-3xl mx-auto rounded-2xl border border-border bg-card p-5 flex gap-3 items-start">
          <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">!</span>
          <p className="text-sm leading-6 text-muted"><span className="font-bold text-foreground">الشفافية:</span> المنصة مجانية. أنت تدفع فقط لشركات الشحن (Yalidine/ZR) مباشرة من حسابك — لا عمولة من COD DZ على الشحن أو الطلبات.</p>
        </div>
      </div>
    </div>
  );
}
