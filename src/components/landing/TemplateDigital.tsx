"use client";
import { useState } from "react";
import CheckoutForm from "@/app/[subdomain]/p/[slug]/CheckoutForm";

type Product = { id: string; name: string; slug: string; description: string | null; price: number; compare_at_price: number | null; image_url: string | null; };
type Merchant = { id: string; business_name: string; subdomain: string; phone: string | null; logo_url: string | null; banner_url?: string | null; description?: string | null; };

type Config = {
  template: "digital";
  primary_color: string;
  accent_color: string;
  hero_title?: string;
  hero_subtitle?: string;
  announcement?: string;
  show_reviews: boolean;
  show_features: boolean;
  show_shipping: boolean;
  footer_text?: string;
  badge_text?: string;
  features?: { title: string; desc: string }[];
  benefits?: string[];
  faq?: { q: string; a: string }[];
  cta_text?: string;
};

export default function TemplateDigital({ product, merchant, config }: { product: Product; merchant: Merchant; config: Config }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const images = [product.image_url].filter(Boolean) as string[];
  const accent = config.primary_color || "#4F46E5";

  return (
    <div className="min-h-screen bg-[#F6F7FF] text-[#111]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap');`}</style>

      {/* Announcement */}
      <div className="h-[28px] bg-[#111] text-white flex items-center justify-center text-[10px] tracking-[0.18em] uppercase font-bold px-4">
        {config.announcement || "LICENCES OFFICIELLES — LIVRAISON INSTANTANÉE — SUPPORT 24/7"}
      </div>

      {/* Header — brand customizable, no top CTA (order at bottom) */}
      <header className="sticky top-0 z-40 h-[64px] flex items-center px-5 lg:px-8 bg-white/90 backdrop-blur border-b border-[#E8EAF6]">
        <div className="flex items-center gap-3">
          {merchant.logo_url && <img src={merchant.logo_url} alt={merchant.business_name} className="w-8 h-8 rounded-lg object-cover border border-[#E8EAF6] bg-white" />}
          <span className="font-mono text-sm font-bold tracking-[0.02em]">{merchant.business_name}</span>
        </div>
      </header>

      {/* Hero — light, high contrast */}
      <section className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-0">
        {/* Left: text on light */}
        <div className="px-5 lg:px-10 py-8 lg:py-12 flex flex-col justify-center bg-[#F6F7FF] border-b lg:border-b-0 lg:border-e border-[#E8EAF6]">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E8EAF6] rounded-full px-3 py-1.5 text-[11px] font-mono tracking-[0.12em] uppercase font-bold w-fit shadow-sm">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} /> Licence officielle
          </div>
          <h1 className="mt-5 font-black tracking-[-0.03em] leading-[0.95] text-[32px] lg:text-[44px] text-[#111]">
            {config.hero_title || product.name}
          </h1>
          <p className="mt-4 text-[15px] leading-6 text-[#444]">
            {config.hero_subtitle || merchant.description || product.description || "Software premium — clé officielle, livraison instantanée par email, support 24/7."}
          </p>
          <div className="mt-6 flex items-baseline gap-3 flex-wrap">
            <span className="text-[28px] font-black" style={{ color: accent }}>{product.price.toLocaleString("fr-DZ")} DZD</span>
            {product.compare_at_price && (
              <>
                <span className="text-sm line-through text-[#888]">{Number(product.compare_at_price).toLocaleString("fr-DZ")} DZD</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">-{Math.round((1 - product.price / Number(product.compare_at_price)) * 100)}%</span>
              </>
            )}
          </div>
          <a href="#order" className="mt-6 inline-flex items-center justify-center h-[48px] px-8 rounded-full font-bold text-white hover:opacity-90 transition-opacity" style={{ background: accent }}>
            {config.cta_text || `Commander — ${product.price.toLocaleString("fr-DZ")} DZD`}
          </a>
          <div className="mt-6 flex gap-4 text-xs font-mono tracking-[0.1em] uppercase text-[#666]">
            <span>Livraison instantanée</span><span>•</span><span>Support 24/7</span><span>•</span><span>Garantie</span>
          </div>
        </div>

        {/* Right: image card on light gradient */}
        <div className="relative bg-gradient-to-br from-[#EEF0FF] to-[#E8EAF6] flex items-center justify-center p-6 lg:p-8 min-h-[380px]">
          {images[0] ? (
            <div className="w-full max-w-[480px]">
              <div className="bg-white rounded-2xl border border-[#E8EAF6] shadow-xl overflow-hidden">
                <div className="h-9 flex items-center gap-1.5 px-4 border-b border-[#E8EAF6] bg-[#FAFAFF]">
                  <span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-[11px] font-mono text-[#888] truncate">licence — {merchant.business_name}</span>
                </div>
                <img src={images[active]} alt={product.name} className="w-full aspect-[16/10] object-cover bg-[#F6F7FF]" />
                <div className="p-3 flex items-center justify-between gap-3 bg-white border-t border-[#E8EAF6]">
                  <span className="text-xs font-mono text-[#666] tracking-[0.08em]">LICENCE KEY ••••• ••••• •••••</span>
                  <span className="text-xs font-bold bg-[#111] text-white px-3 py-1.5 rounded-full whitespace-nowrap">Activer</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 justify-center">
                {images.slice(0, 3).map((src, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white ${active === i ? "border-[#111] shadow-sm" : "border-[#E8EAF6] opacity-70 hover:opacity-100"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[480px] aspect-[16/10] bg-white border border-[#E8EAF6] rounded-2xl flex items-center justify-center text-sm text-[#888] shadow-sm">Aucune image</div>
          )}
        </div>
      </section>

      {/* Details + Order */}
      <section id="order" className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-0 border-t border-[#E8EAF6]">
        <div className="p-6 lg:p-8 bg-white border-b lg:border-b-0 lg:border-e border-[#E8EAF6]">
          <h2 className="font-mono text-xs tracking-[0.18em] uppercase text-[#888]">Détails</h2>
          <p className="text-sm leading-6 text-[#333] mt-3">{merchant.description || product.description || "Software premium avec licence officielle, installation guidée, support 24/7."}</p>
          <div className="mt-5 rounded-xl overflow-hidden border border-[#E8EAF6] divide-y divide-[#E8EAF6] bg-[#FAFAFF]">
            <div className="flex justify-between p-3.5 bg-white font-mono text-xs"><span className="text-[#666]">Version</span><span className="font-bold">2.5.0</span></div>
            <div className="flex justify-between p-3.5 bg-white font-mono text-xs"><span className="text-[#666]">Compatibilité</span><span>Windows • macOS</span></div>
            <div className="flex justify-between p-3.5 bg-white font-mono text-xs"><span className="text-[#666]">Support</span><span>24/7 chat</span></div>
          </div>
          <div className="mt-5 space-y-2">
            {[
              { q: "Comment recevoir la licence ?", a: "Clé envoyée par email instantanément après confirmation du paiement." },
              { q: "Garantie ?", a: "12 mois, remboursement si dysfonctionnement." },
            ].map((f, i) => (
              <div key={f.q} className="border border-[#E8EAF6] rounded-xl bg-white">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between p-3.5 text-sm font-medium">
                  <span>{f.q}</span><span className="w-6 h-6 rounded-full bg-[#F6F7FF] border border-[#E8EAF6] flex items-center justify-center text-xs">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && <div className="px-3.5 pb-3.5 text-sm text-[#555] leading-5">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 lg:p-8 bg-[#F6F7FF]">
          <div className="bg-white rounded-2xl border border-[#E8EAF6] p-6 shadow-sm">
            <h3 className="font-bold text-lg">Commander</h3>
            <p className="text-xs text-[#666] mt-1">Paiement à la livraison — livraison numérique instantanée</p>
            <div className="mt-5">
              <CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8EAF6] bg-white py-6 text-center text-xs font-mono text-[#888]">© {merchant.business_name} — ORDELY</footer>
    </div>
  );
}
