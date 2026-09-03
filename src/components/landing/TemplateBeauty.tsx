"use client";
import { useState } from "react";
import CheckoutForm from "@/app/[subdomain]/p/[slug]/CheckoutForm";

type Product = { id: string; name: string; slug: string; description: string | null; price: number; compare_at_price: number | null; image_url: string | null; };
type Merchant = { id: string; business_name: string; subdomain: string; phone: string | null; logo_url: string | null; banner_url?: string | null; description?: string | null; };
type Config = { announcement?: string; hero_title?: string; hero_subtitle?: string; footer_text?: string; badge_text?: string; cta_text?: string; show_shipping?: boolean; show_ingredients?: boolean; show_specs?: boolean; show_faq?: boolean; };

export default function TemplateBeauty({ product, merchant, config }: { product: Product; merchant: Merchant; config: Config }) {
  const [active, setActive] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const images = [product.image_url, product.image_url, product.image_url].filter(Boolean) as string[];
  const hasImages = images.length > 0;
  const nameParts = merchant.business_name.split(" ");
  const firstWord = nameParts[0] || "Maison";
  const restWords = nameParts.slice(1).join(" ") || "Terre";

  const ing = (product.name.split(" ").slice(0,3).map(w=>w.replace(/[^A-Za-z0-9\u0600-\u06FF]/g,'')).filter(Boolean).slice(0,3) as string[]);
  const ingFallback = ing.length ? ing : ["Naturel","Fait main","Sans sulfate"];
  const details: [string,string][] = [
    ["Origine", "Fabriqué en Algérie — ingrédients naturels"],
    ["Texture", product.description?.slice(0,60) || "Texture légère, pénétration rapide"],
    ["Pour qui", "Tous types de peau"],
  ];
  const faq = [
    { q: "Livraison ?", a: "24/48h Nord, 2-3 jours Sud. Paiement à la livraison." },
    { q: "Convient peau sensible ?", a: "Oui, formule douce sans sulfate, testée dermatologiquement." },
    { q: "Retours ?", a: "14 jours, sans question." },
  ];

  return (
    <div style={{ background: "#F8F5F0", color: "#2B2A28" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
.beauty-root{background:#F8F5F0;color:#2B2A28;font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.serif{font-family:'Fraunces',serif}
a{color:inherit;text-decoration:none}
.beauty-top{height:32px;background:#2B2A28;color:#F8F5F0;display:flex;align-items:center;justify-content:center;font-size:10px;letter-spacing:.14em;text-transform:uppercase}
.beauty-head{position:sticky;top:0;z-index:40;height:68px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;background:rgba(248,245,240,.86);backdrop-filter:blur(18px);border-bottom:1px solid #E8E0D5}
@media(min-width:1024px){.beauty-head{padding:0 36px}}
.beauty-logo{font-family:'Fraunces',serif;font-size:18px;letter-spacing:-.02em;font-weight:500;display:flex;align-items:center;gap:8px}
.beauty-logo em{font-style:italic;color:#C47A5A}
.product-page{max-width:1280px;margin:0 auto;background:#FEFEFD;border-left:1px solid #E8E0D5;border-right:1px solid #E8E0D5}
.breadcrumb{padding:14px 20px;border-bottom:1px solid #E8E0D5;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8A7F75;display:flex;gap:8px}
@media(min-width:1024px){.breadcrumb{padding:14px 32px}}
.p-hero{display:grid;border-bottom:1px solid #E8E0D5}
@media(min-width:1024px){.p-hero{grid-template-columns:1.1fr .9fr;min-height:78vh}}
.p-gallery{background:#F6F1E8;padding:20px;display:flex;flex-direction:column;gap:12px}
@media(min-width:1024px){.p-gallery{padding:24px;border-right:1px solid #E8E0D5}}
.p-main{aspect-ratio:1/1;background:#FEFEFD;border-radius:20px;border:1px solid #E8E0D5;display:flex;align-items:center;justify-content:center;padding:18px;overflow:hidden}
.p-main img{width:100%;height:100%;object-fit:cover;border-radius:14px;transition:.4s}
.p-thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.p-thumb{aspect-ratio:1/1;background:#FEFEFD;border-radius:12px;border:1px solid #E8E0D5;display:flex;align-items:center;justify-content:center;padding:8px;cursor:pointer;opacity:.6;transition:.2s}
.p-thumb.active{opacity:1;border-color:#2B2A28;background:#FEFEFD}
.p-thumb img{width:100%;height:100%;object-fit:cover;border-radius:8px}
.p-info{padding:24px 20px}
@media(min-width:1024px){.p-info{padding:32px}}
.p-title{font-family:'Fraunces',serif;font-size:28px;line-height:.95;letter-spacing:-.03em}
@media(min-width:1024px){.p-title{font-size:34px}}
.p-price{margin-top:10px;font-size:18px;font-weight:600}
.p-price small{font-size:12px;opacity:.4;text-decoration:line-through;margin-left:8px;font-weight:400}
.p-desc{margin-top:14px;font-size:13px;line-height:1.6;color:#6B655E}
.p-ing{margin-top:18px;padding:14px;background:#F6F1E8;border-radius:12px;border:1px solid #EDE8E0}
.p-ing .h{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8A7F75;margin-bottom:8px}
.p-ing .tags{display:flex;gap:6px;flex-wrap:wrap}
.p-ing .tags span{font-size:10px;padding:6px 10px;background:#FEFEFD;border:1px solid #E8E0D5;border-radius:999px}
.btnCommander{width:100%;height:54px;background:#2B2A28;color:#FEFEFD;border:none;border-radius:999px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;cursor:pointer;transition:.2s}
.btnCommander:hover{background:#000}
.faq{margin-top:28px;border-top:1px solid #E8E0D5}
.faq-item{border-bottom:1px solid #E8E0D5;padding:14px 0}
.faq-q{font-size:12px;font-weight:600;display:flex;justify-content:space-between;cursor:pointer}
.faq-a{font-size:12px;color:#6B655E;line-height:1.5;margin-top:8px;display:none}
.faq-item.open .faq-a{display:block}
`}</style>
      <div className="beauty-root min-h-screen">
        {config.show_shipping !== false && <div className="beauty-top">{config.announcement || "Livraison 58 Wilayas — Paiement à la livraison — Naturel & fait main — Retour 14 jours"}</div>}
        <div className="beauty-head">
          <div className="beauty-logo">
            {merchant.logo_url && <img src={merchant.logo_url} alt={merchant.business_name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", border: "1px solid #E8E0D5", background: "#fff" }} />}
            <span>{firstWord} <em>{restWords}</em></span>
          </div>
          <span style={{ fontSize: 11, letterSpacing: ".1em", opacity: .6 }}>{merchant.business_name}</span>
        </div>

        <div className="product-page">
          <div className="breadcrumb">
            <a href="/">Accueil</a> / <span>{product.name}</span>
          </div>
          <div className="p-hero">
            <div className="p-gallery">
              <div className="p-main">
                {hasImages ? <img src={images[active]} alt={product.name} /> : <span style={{ fontSize: 12, color: "#8A7F75" }}>Aucune image</span>}
              </div>
              {hasImages && (
                <div className="p-thumbs">
                  {images.slice(0,3).map((src,i)=>(
                    <div key={i} className={`p-thumb ${active===i?'active':''}`} onClick={()=>setActive(i)}>
                      <img src={src} alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-info">
              <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#C47A5A" }}>{config.badge_text || "Naturel"} — Stock limité</div>
              <div className="p-title" style={{ marginTop: 8 }}>{config.hero_title || product.name}</div>
              <div style={{ fontSize: 11, color: "#8A7F75", marginTop: 4 }}>{merchant.description || "100% naturel — Fabriqué en Algérie"}</div>
              <div className="p-price">{product.price.toLocaleString("fr-DZ")} DA {product.compare_at_price && <small>{Number(product.compare_at_price).toLocaleString("fr-DZ")} DA</small>}</div>
              <div className="p-desc">{config.hero_subtitle || product.description || "Formulé avec huile d'olive de Kabylie, miel de montagne. Sans sulfate, sans parfum ajouté. Doux pour toute la famille."}</div>
              {config.show_ingredients !== false && (
                <div className="p-ing">
                  <div className="h">Ingrédients clés</div>
                  <div className="tags">{ingFallback.map(t=> <span key={t}>{t}</span>)}</div>
                </div>
              )}
              {config.show_specs !== false && (
                <div style={{ marginTop: 16, border: "1px solid #E8E0D5", borderRadius: 12, overflow: "hidden" }}>
                  {details.map(([k,v])=>(
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #F0EBE3", fontSize: 12 }}>
                      <span style={{ color: "#8A7F75" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout — paiement à la livraison */}
              <div style={{ marginTop: 20, background: "#fff", border: "1px solid #E8E0D5", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{config.cta_text || "Commander — Paiement à la livraison"}</div>
                <div style={{ fontSize: 11, color: "#8A7F75", marginTop: 4 }}>Livraison 24/48H • 58 Wilayas • Test avant paiement</div>
                <div style={{ marginTop: 14 }}>
                  <CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} />
                </div>
              </div>

              {config.show_faq !== false && (
                <div className="faq">
                  {faq.map((f,i)=>(
                    <div key={f.q} className={`faq-item ${openFaq===i?'open':''}`} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                      <div className="faq-q"><span>{f.q}</span><span>{openFaq===i?'−':'+'}</span></div>
                      <div className="faq-a">{f.a}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "20px", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#8A7F75", borderTop: "1px solid #E8E0D5", background: "#F8F5F0" }}>
          © 2026 {merchant.business_name} — ORDELY • {config.footer_text || "Paiement à la livraison — Retour 14 jours"}
        </div>
      </div>
    </div>
  );
}
