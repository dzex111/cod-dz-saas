import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">O</div>
            <span className="font-bold text-[17px] tracking-tight text-ink">ORDELY</span>
            <span className="hidden sm:inline text-[10px] font-semibold tracking-widest border border-border px-2 py-1 rounded">COD Operations</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <a href="#features" className="hover:text-foreground">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-card-hover">Sign in</Link>
            <Link href="/register" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover">Start free</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary-light border border-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">ORDELY — كل طلب تحت السيطرة</div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight text-ink">
            Every order,<br />
            <span className="text-primary">under control.</span>
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-muted max-w-[560px]">
            Ordely helps COD stores organize, verify and manage orders from one clear workspace.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/register" className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover">Start free</Link>
            <Link href="/pricing" className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-card-hover">Book a demo</Link>
          </div>
          <p className="mt-4 text-xs text-muted-soft">Free onboarding for selected stores • No card required</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Ordely Orders</span>
            <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full font-medium">Live</span>
          </div>
          <div className="p-4 space-y-2">
            {[
              { name: "Amine — 07XXXXXXXX", meta: "Oran • 3,500 DZD", status: "Pending", tone: "bg-amber-50 text-amber-700 border-amber-200" },
              { name: "Yacine — 06XXXXXXXX", meta: "Constantine • flagged", status: "Duplicate", tone: "bg-red-50 text-red-700 border-red-200" },
              { name: "Sara — 05XXXXXXXX", meta: "Algiers • TRK-8421", status: "Shipped", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            ].map((r) => (
              <div key={r.name} className="flex justify-between items-center border border-border rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted">{r.meta}</div>
                </div>
                <span className={`text-xs font-medium border px-2.5 py-1 rounded-full ${r.tone}`}>{r.status}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 p-4 border-t border-border bg-card-hover/50">
            <div className="bg-card border border-border rounded-lg p-3 text-center"><div className="text-lg font-bold">1,248</div><div className="text-xs text-muted">Orders</div></div>
            <div className="bg-card border border-border rounded-lg p-3 text-center"><div className="text-lg font-bold">94%</div><div className="text-xs text-muted">Verified</div></div>
            <div className="bg-card border border-border rounded-lg p-3 text-center"><div className="text-lg font-bold">58</div><div className="text-xs text-muted">Wilayas</div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap gap-6 text-sm">
          <span className="font-medium text-ink">Too many orders. Too many tabs. Too many mistakes.</span>
          <span className="text-muted">Ordely turns scattered order handling into one structured workflow.</span>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold">Built for stores that process real orders.</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { t: "Order workspace", d: "View, filter and act on orders quickly." },
            { t: "Verification workflow", d: "Move orders through clear confirmation states." },
            { t: "Duplicate & risk signals", d: "Surface suspicious or repeated orders before they create cost." },
            { t: "Team workflow", d: "Give each person the right access and responsibilities." },
            { t: "Operational analytics", d: "See where orders are stuck and where efficiency is lost." },
            { t: "Integrations", d: "Connect logistics and tools without changing your workflow." },
          ].map((f) => (
            <div key={f.t} className="border border-border bg-card rounded-xl p-5">
              <h3 className="font-semibold text-sm">{f.t}</h3>
              <p className="text-sm text-muted mt-1">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-xl bg-ink text-white p-8 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Ready to put your orders under control?</h3>
            <p className="text-white/70 text-sm mt-1">Start your free Ordely trial.</p>
          </div>
          <Link href="/register" className="self-start px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover">Start free</Link>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        © 2026 ORDELY — COD Operations Platform
      </footer>
    </div>
  );
}
