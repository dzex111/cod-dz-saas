"use client";
import { useState, useEffect, useRef } from "react";
import CheckoutForm from "@/app/[subdomain]/p/[slug]/CheckoutForm";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
};
type Merchant = {
  id: string;
  business_name: string;
  subdomain: string;
  phone: string | null;
  logo_url: string | null;
};
type Config = {
  primary_color: string;
  hero_title?: string;
  hero_subtitle?: string;
  announcement?: string;
  footer_text?: string;
};

export default function TemplateAtelier({ product, merchant, config }: { product: Product; merchant: Merchant; config: Config }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const images = [product.image_url, product.image_url, product.image_url].filter(Boolean) as string[];
  const heroRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111] selection:bg-[#111] selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap'); .font-serif{font-family:'Instrument Serif','Times New Roman',serif;} .marquee{animation:marquee 28s linear infinite;} @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} .reveal{overflow:hidden;display:block} .reveal span{display:block;transform:translateY(110%);transition:transform 1.1s cubic-bezier(0.16,1,0.3,1)} .reveal span.in{transform:translateY(0)}`}</style>

      {/* Cursor dot */}
      <div className="hidden lg:block fixed top-0 left-0 w-[6px] h-[6px] rounded-full bg-[#111] pointer-events-none z-[9999]" style={{ transform: `translate3d(0,0,0)` }} />

      {/* Marquee */}
      <div className="h-[36px] w-full border-b border-[#E8E6E1] bg-[#FAF9F6] flex items-center overflow-hidden">
        <div className="flex w-[200%] marquee will-change-transform">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap text-[10px] tracking-[0.18em] uppercase font-medium px-8">
              {config.announcement || "LIVRAISON GRATUITE 58 WILAYAS — PAIEMENT À LA LIVRAISON — RETOURS 14 JOURS — ATELIER ALG NO.04"}
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/80 backdrop-blur-[12px] border-b border-[#E8E6E1] h-[56px] flex items-center">
        <div className="w-full max-w-[1600px] mx-auto px-5 lg:px-8 flex items-center justify-between">
          <div className="font-serif text-[17px] tracking-[-0.02em]">ATELIER <span className="opacity-40">/</span> ALG</div>
          <div className="flex items-center gap-6 text-[11px] tracking-[0.12em] uppercase">
            <a href="#order" className="hover:opacity-60 transition-opacity">Panier (1)</a>
            <span className="hidden sm:inline opacity-30">—</span>
            <span className="hidden sm:inline font-medium">{merchant.business_name}</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative w-full border-b border-[#E8E6E1] overflow-hidden">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-92px)]">
          <div className="w-full lg:w-[50%] px-5 lg:px-8 pt-10 lg:pt-[9vh] pb-8 flex flex-col justify-between">
            <div>
              <div className="font-serif leading-[0.9] tracking-[-0.03em] text-[13vw] lg:text-[7vw]">
                <span className="reveal"><span className={inView ? "in" : ""} style={{ transitionDelay: "0.1s" }}>{config.hero_title || product.name.split(" ")[0] || "ATELIER"}</span></span>
                <span className="reveal"><span className={inView ? "in" : ""} style={{ transitionDelay: "0.2s" }}>{product.name.split(" ").slice(1).join(" ") || "EDIT.04"}</span></span>
              </div>
              <p className="mt-6 text-sm leading-6 max-w-md text-[#111]/70">{config.hero_subtitle || product.description || "Une pièce pensée pour le quotidien algérien — coupe précise, matière durable, détails maîtrisés."}</p>
              <div className="mt-6 flex items-baseline gap-4">
                <span className="font-serif text-3xl">{product.price.toLocaleString("fr-DZ")} DZD</span>
                {product.compare_at_price && <span className="text-sm line-through opacity-40">{Number(product.compare_at_price).toLocaleString("fr-DZ")} DZD</span>}
              </div>
              <a href="#order" className="mt-8 inline-flex bg-[#111] text-white px-8 py-3 text-xs tracking-[0.14em] uppercase hover:bg-black transition-colors">Commander — Paiement à la livraison</a>
            </div>
            <div className="mt-10 flex gap-8 text-xs">
              <div><div className="font-medium">58 Wilayas</div><div className="opacity-50">Livraison 24-48h</div></div>
              <div><div className="font-medium">Paiement à la livraison</div><div className="opacity-50">Sans carte</div></div>
              <div><div className="font-medium">Retours 14j</div><div className="opacity-50">Garantie</div></div>
            </div>
          </div>
          <div className="w-full lg:w-[50%] bg-[#EDEBE6] border-t lg:border-t-0 lg:border-s border-[#E8E6E1] p-6 lg:p-8 flex items-center justify-center">
            {images[0] ? (
              <div className="w-full max-w-[520px] bg-white border border-[#E8E6E1] rounded-[4px] overflow-hidden group">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={images[active]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                </div>
                <div className="flex gap-2 p-3 bg-white border-t border-[#E8E6E1]">
                  {images.slice(0, 3).map((src, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`w-16 h-16 rounded-[4px] overflow-hidden border ${active === i ? "border-[#111]" : "border-[#E8E6E1] opacity-70 hover:opacity-100"}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[520px] aspect-[4/5] bg-white border border-[#E8E6E1] flex items-center justify-center text-sm opacity-40">Aucune image</div>
            )}
          </div>
        </div>
      </section>

      {/* Order */}
      <section id="order" className="max-w-[1600px] mx-auto px-5 lg:px-8 py-10 grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl">Détails</h2>
          <p className="text-sm leading-6 opacity-70">{product.description || "Conçu et assemblé avec exigence. Matières sélectionnées, finitions soignées."}</p>
          <div className="border border-[#E8E6E1] rounded-[4px] divide-y divide-[#E8E6E1]">
            {[
              { q: "Livraison", a: "Nord 24-48h, Sud 2-3 jours. Paiement à la réception." },
              { q: "Retours", a: "14 jours, sans question." },
              { q: "Support", a: merchant.phone ? `Tel: ${merchant.phone}` : "Support via Ordely." },
            ].map((f, i) => (
              <div key={f.q} className="p-4">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between text-sm font-medium">
                  <span>{f.q}</span><span className="opacity-40">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && <div className="text-sm opacity-60 mt-2">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#E8E6E1] rounded-[4px] p-6 h-fit lg:sticky lg:top-[72px]">
          <h3 className="font-medium">Commander</h3>
          <p className="text-xs opacity-60 mt-1">Paiement à la livraison — confirmation par téléphone</p>
          <div className="mt-5">
            <CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} />
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8E6E1] bg-[#FAF9F6] py-8">
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 flex justify-between text-xs">
          <span className="font-serif">ORDELY • {merchant.business_name}</span>
          <span className="opacity-50">{config.footer_text || "© 2026 — Tous droits réservés"}</span>
        </div>
      </footer>
    </div>
  );
}
