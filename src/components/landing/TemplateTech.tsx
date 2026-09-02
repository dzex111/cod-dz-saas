"use client";
import { useState } from "react";
import CheckoutForm from "@/app/[subdomain]/p/[slug]/CheckoutForm";

type Product = { id: string; name: string; slug: string; description: string | null; price: number; compare_at_price: number | null; image_url: string | null; };
type Merchant = { id: string; business_name: string; subdomain: string; phone: string | null; logo_url?: string | null; banner_url?: string | null; description?: string | null; };
type Config = { announcement?: string; hero_title?: string; hero_subtitle?: string; footer_text?: string; cta_color?: string; font?: string; button_radius?: string; };

export default function TemplateTech({ product, merchant, config }: { product: Product; merchant: Merchant; config: Config }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const images = [product.image_url, product.image_url].filter(Boolean) as string[];
  const titleWords = (config.hero_title || product.name || "NOVA PRO").split(" ");
  const t1 = titleWords[0] || "NOVA";
  const t2 = titleWords.slice(1).join(" ") || "PRO";

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#EDEDED]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap');`}</style>
      <div className="h-[28px] bg-[#EDEDED] text-[#0B0B0C] flex items-center justify-center text-[10px] tracking-[0.18em] uppercase font-bold">
        {config.announcement || "LIVRAISON GRATUITE 58 WILAYAS — PAIEMENT À LA LIVRAISON — GARANTIE 12 MOIS"}
      </div>
      <header className="sticky top-0 z-40 h-[64px] flex items-center px-5 lg:px-8 bg-[rgba(11,11,12,0.95)] backdrop-blur border-b border-white/20">
        <div className="flex items-center gap-3 font-mono text-xs tracking-[0.14em] text-white">
          {merchant.logo_url && <img src={merchant.logo_url} alt={merchant.business_name} className="w-7 h-7 rounded object-cover border border-white/20 bg-white" />}
          <span className="font-bold tracking-[0.14em]">{merchant.business_name}</span>
        </div>
      </header>

      <section className="grid lg:grid-cols-[1.05fr_0.95fr] min-h-[82vh] border-b border-white/20">
        <div className="px-5 lg:px-12 py-10 lg:py-16 flex flex-col justify-center">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/60 flex gap-4 mb-6">
            <span>EDITION 2024</span><span>58 WILAYAS</span><span>GARANTIE</span>
          </div>
          <h1 className="text-[12vw] lg:text-[5.4vw] leading-[0.88] tracking-[-0.06em] font-bold uppercase">
            <span className="block overflow-hidden"><span className="block text-white">{t1}</span></span>
            <span className="block overflow-hidden"><span className="block" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.85)", color: "transparent" }}>{t2}</span></span>
          </h1>
          <p className="mt-6 max-w-[380px] text-sm leading-relaxed text-white/75">{config.hero_subtitle || merchant.description || product.description || "Performance pure, design minimal — conçu pour durer."}</p>
          <div className="mt-8 flex gap-3">
            {/* CTA hero removed — order only at bottom */}
            {product.compare_at_price && <span className="self-center text-sm line-through opacity-30">{Number(product.compare_at_price).toLocaleString("fr-DZ")} DZD</span>}
          </div>
        </div>
        <div className="relative bg-[radial-gradient(90%_70%_at_50%_30%,#18181A_0%,#0F0F10_60%,#0B0B0C_100%)] flex items-center justify-center p-8 lg:p-12 min-h-[400px]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          {images[0] ? (
            <div className="relative w-full max-w-[480px]">
              <img src={images[active]} alt={product.name} className="w-full aspect-square object-contain drop-shadow-2xl" />
              <div className="flex gap-2 mt-6 justify-center">
                {images.slice(0, 2).map((src, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`w-16 h-16 rounded-lg overflow-hidden border bg-[#121214] p-2 ${active === i ? "border-white/20 opacity-100" : "border-white/10 opacity-50 hover:opacity-100"}`}>
                    <img src={src} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[480px] aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-sm opacity-40">Aucune image</div>
          )}
        </div>
      </section>

      <section id="order" className="max-w-[1280px] mx-auto border-x border-white/20 grid lg:grid-cols-2">
        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
          <h2 className="font-mono text-xs tracking-[0.18em] uppercase opacity-40">Détails techniques</h2>
          <p className="text-sm leading-relaxed opacity-60 mt-4">{product.description || "Conçu pour la performance et la durabilité. Batterie longue durée, charge rapide, finition premium."}</p>
          <div className="mt-6 grid gap-px bg-white/10 border border-white/10">
            <div className="flex justify-between p-3 bg-[#0B0B0C] font-mono text-xs"><span className="opacity-40">Batterie</span><span>5000mAh • 33W</span></div>
            <div className="flex justify-between p-3 bg-[#0B0B0C] font-mono text-xs"><span className="opacity-40">Garantie</span><span>12 mois</span></div>
            <div className="flex justify-between p-3 bg-[#0B0B0C] font-mono text-xs"><span className="opacity-40">Livraison</span><span>58 Wilayas • 24-48h</span></div>
          </div>
          <div className="mt-6 space-y-2">
            {[
              { q: "Livraison", a: "Nord 24-48h, Sud 2-3 jours. Paiement à la réception." },
              { q: "Retours", a: "14 jours, sans question." },
            ].map((f, i) => (
              <div key={f.q} className="border border-white/10 rounded-lg">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between p-3 text-sm">
                  <span>{f.q}</span><span className="opacity-40">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && <div className="px-3 pb-3 text-sm opacity-60">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white text-[#111] p-6 lg:p-8">
          <h3 className="font-bold">Commander</h3>
          <p className="text-xs opacity-60 mt-1">Paiement à la livraison — 58 wilayas</p>
          <div className="mt-6">
            <CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-xs font-mono opacity-40">© {merchant.business_name} — ORDELY</footer>
    </div>
  );
}
