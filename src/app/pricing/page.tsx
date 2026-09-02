import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const plans = [
  { name: "Starter", price: "0 DZD", period: "Free to start", features: ["Unlimited orders", "Unlimited products", "Verification workflow", "Duplicate signals"], cta: "Start free", href: "/register", highlight: true },
  { name: "Growth", price: "0 DZD", period: "Free during launch", features: ["Everything in Starter", "Team access", "Analytics", "Priority support"], cta: "Join launch", href: "/register", highlight: false },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold">ORDELY</Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <h1 className="text-3xl font-bold">Simple pricing. Start free.</h1>
        <p className="text-muted mt-2">Free onboarding for selected stores while we refine Ordely with real operators.</p>
        <div className="mt-8 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-xl border p-6 ${p.highlight ? "border-primary bg-card shadow-sm" : "border-border bg-card"}`}>
              <h3 className="font-semibold">{p.name}</h3>
              <div className="mt-2 flex gap-2 items-baseline"><span className="text-2xl font-bold">{p.price}</span><span className="text-sm text-muted">{p.period}</span></div>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {p.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <Link href={p.href} className={`mt-6 block text-center py-2.5 rounded-lg font-medium ${p.highlight ? "bg-primary text-white hover:bg-primary-hover" : "border border-border hover:bg-card-hover"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
