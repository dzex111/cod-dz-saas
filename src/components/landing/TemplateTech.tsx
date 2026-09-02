"use client";
import { useState } from "react";
import CheckoutForm from "@/app/[subdomain]/p/[slug]/CheckoutForm";

type Product = { id: string; name: string; slug: string; description: string | null; price: number; compare_at_price: number | null; image_url: string | null; };
type Merchant = { id: string; business_name: string; subdomain: string; phone: string | null; };
type Config = { announcement?: string; hero_title?: string; hero_subtitle?: string; footer_text?: string; };

export default function TemplateTech({ product, merchant, config }: { product: Product; merchant: Merchant; config: Config }) {
  const [active, setActive] = useState(0);
  const images = [product.image_url, product.image_url].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#EDEDED] selection:bg-white selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap');`}</style>
      <div className="h-[28px] bg-[#EDEDED] text-[#0B0B0C] flex items-center justify-center text-[10px] tracking-[0.18em] uppercase font-bold">
        {config.announcement || "LIVRAISON 58 WILAYAS — PAIEMENT À LA LIVRAISON — GARANTIE 12 MOIS"}
      </div>
      <header className="sticky top-0 z-40 h-[64px] flex justify-between items-center px-5 lg:px-8 bg-[rgba(11,11,12,0.9)] backdrop-blur border-b border-white/10">
        <div className="font-mono text-xs tracking-[0.14em]">NOVA <span className="opacity-40">TECH</span></div>
        <div className="text-xs font-mono opacity-60 hidden sm:block">{merchant.business_name}</div>
        <a href="#order" className="font-mono text-xs tracking-[0.12em] border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors">PANIER (1)</a>
      </header>

      <section className="grid lg:grid-cols-[1.05fr_0.95fr] min-h-[82vh] border-b border-white/10">
        <div className="px-5 lg:px-12 py-10 lg:py-16 flex flex-col justify-center">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-40 flex gap-4 mb-6">
            <span>EDITION 2024</span><span>58 WILAYAS</span><span>GARANTIE</span>
          </div>
          <h1 className="text-[12vw] lg:text-[5vw] leading-[0.88] tracking-[-0.06em] font-bold uppercase">
            <span className="block overflow-hidden"><span className="block">{config.hero_title || product.name.split(" ")[0] || "NOVA"}</span></span>
            <span className="block overflow-hidden"><span className="block" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.28)", color: "transparent" }}>{product.name.split(" ").slice(1).join(" ") || "PRO"}</span></span>
          </h1>
          <p className="mt-6 max-w-[380px] text-sm leading-relaxed opacity-50">{config.hero_subtitle || product.description || "Performance pure, design minimal — conçu pour durer."}</p>
          <div className="mt-8 flex gap-3">
            <a href="#order" className="h-[46px] px-7 bg-[#EDEDED] text-[#0B0B0C] font-mono text-xs tracking-[0.14em] uppercase font-bold flex items-center hover:bg-white">Commander — {product.price.toLocaleString("fr-DZ")} DZD</a>
            {product.compare_at_price && <span className="self-center text-sm line-through opacity-30">{Number(product.compare_at_price).toLocaleString("fr-DZ")} DZD</span>}
          </div>
          <div className="mt-10 flex gap-6 text-xs font-mono opacity-40">
            <span>58 WILAYAS</span><span>•</span><span>PAY ON DELIVERY</span><span>•</span><span>GARANTIE 12M</span>
          </div>
        </div>
        <div className="relative bg-[radial-gradient(90%_70%_at_50%_30%,#18181A_0%,#0F0F10_60%,#0B0B0C_100%)] flex items-center justify-center p-8 lg:p-12 min-h-[400px]">
          {images[0] ? (
            <div className="w-full max-w-[480px] bg-white rounded-[12px] overflow-hidden p-4">
              <img src={images[active]} alt={product.name} className="w-full aspect-square object-contain" />
              <div className="flex gap-2 mt-4 justify-center">
                {images.slice(0, 2).map((src, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`w-16 h-16 rounded-lg overflow-hidden border ${active === i ? "border-white" : "border-white/10 opacity-60"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[480px] aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-sm opacity-40">Aucune image</div>
          )}
        </div>
      </section>

      <section id="order" className="max-w-[1600px] mx-auto px-5 lg:px-8 py-10 grid lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <h2 className="font-mono text-xs tracking-[0.18em] uppercase opacity-40">Détails techniques</h2>
          <p className="text-sm leading-relaxed opacity-60">{product.description || "Conçu pour la performance et la durabilité. Batterie longue durée, charge rapide, finition premium."}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-white/10 rounded-lg p-4 bg-white/[0.03]"><div className="font-mono opacity-40">Batterie</div><div className="font-medium mt-1">5000mAh • 33W</div></div>
            <div className="border border-white/10 rounded-lg p-4 bg-white/[0.03]"><div className="font-mono opacity-40">Garantie</div><div className="font-medium mt-1">12 mois</div></div>
          </div>
        </div>
        <div className="bg-white text-[#111] rounded-xl p-6 h-fit lg:sticky lg:top-[80px]">
          <h3 className="font-bold">Commander</h3>
          <p className="text-xs opacity-60 mt-1">Paiement à la livraison — 58 wilayas</p>
          <div className="mt-5">
            <CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-xs font-mono opacity-40">
        © {merchant.business_name} • NOVA TECH — ORDELY
      </footer>
    </div>
  );
}
