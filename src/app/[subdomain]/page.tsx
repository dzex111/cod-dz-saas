import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IconPackage } from "@/components/icons";
import { getStoreConfig } from "@/lib/store-config";
import StorefrontClient from "@/components/StorefrontClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params;
  const admin = createAdminClient();
  const { data: m } = await admin.from("merchants").select("business_name").eq("subdomain", subdomain).single();
  return {
    title: m ? `${m.business_name} | ORDELY` : "متجر | ORDELY",
    description: m ? `تسوق من ${m.business_name} — دفع عند الاستلام، توصيل 58 ولاية` : "متجر دفع عند الاستلام",
    openGraph: { title: m?.business_name, description: "دفع عند الاستلام — 58 ولاية", locale: "ar_DZ" },
  };
}

export default async function StorefrontHome({ params, searchParams }: { params: Promise<{ subdomain: string }>, searchParams: Promise<{ q?: string, sort?: string, cat?: string }> }) {
  const { subdomain } = await params;
  const { q, sort, cat } = await searchParams;
  const supabaseAdmin = createAdminClient();
  const { data: merchant } = await supabaseAdmin.from("merchants").select("id, business_name, subdomain, logo_url, description, primary_color, banner_url").eq("subdomain", subdomain).single();
  if (!merchant) return notFound();

  const cfg = await getStoreConfig(merchant.id);

  let query = supabaseAdmin.from("products").select("*").eq("merchant_id", merchant.id).eq("is_active", true);
  if (q) query = query.ilike("name", `%${q}%`);
  if (cat) query = query.eq("category", cat);
  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  const { data: products } = await query.limit(24);
  const heroProduct = products?.[0];
  const heroImage = heroProduct?.image_url || merchant.banner_url || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1500&fit=crop";

  if (cfg.template === "tech") {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#EDEDED]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap');`}</style>
        {cfg.show_shipping !== false && (
          <div className="h-[28px] bg-[#EDEDED] text-[#0B0B0C] flex items-center justify-center text-[10px] tracking-[0.18em] uppercase font-bold">
            {cfg.announcement || "LIVRAISON 58 WILAYAS — PAIEMENT À LA LIVRAISON — GARANTIE 12 MOIS"}
          </div>
        )}
        <header className="sticky top-0 z-40 h-[64px] flex justify-between items-center px-5 lg:px-8 bg-[rgba(11,11,12,0.95)] backdrop-blur border-b border-white/20">
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.14em] text-white">
            {merchant.logo_url && <img src={merchant.logo_url} alt={merchant.business_name} className="w-7 h-7 rounded object-cover border border-white/20 bg-white" />}
            <span className="font-bold tracking-[0.14em]">{merchant.business_name}</span>
          </div>
          <div className="text-xs font-mono text-white/60">{products?.length || 0} produits</div>
        </header>

        {/* Hero — brand customizable, banner is hero image itself (heroImage = product.image || merchant.banner_url) */}
        <section className="grid lg:grid-cols-[1.05fr_0.95fr] min-h-[82vh] border-b border-white/20">
          <div className="px-5 lg:px-12 py-10 lg:py-16 flex flex-col justify-center">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/60 flex gap-4 mb-6">
              <span>EDITION 2024</span><span>58 WILAYAS</span><span>GARANTIE</span>
            </div>
            <h1 className="text-[11vw] lg:text-[5vw] leading-[0.88] tracking-[-0.06em] font-black uppercase break-words">
              <span className="block overflow-hidden"><span className="block text-white">{merchant.business_name}</span></span>
            </h1>
            <p className="mt-6 max-w-[380px] text-sm leading-relaxed text-white/75">{merchant.description || "Performance pure, design minimal — conçu pour les produits électroniques et téléphones."}</p>
            <div className="mt-8">
              <a href="#collection" className="h-[46px] px-7 bg-[#EDEDED] text-[#0B0B0C] font-mono text-xs tracking-[0.14em] uppercase font-bold inline-flex items-center hover:bg-white">Explorer la collection</a>
            </div>
          </div>
          <div className="relative bg-[radial-gradient(90%_70%_at_50%_30%,#18181A_0%,#0F0F10_60%,#0B0B0C_100%)] flex items-center justify-center p-8 lg:p-12 min-h-[400px] border-t lg:border-t-0 lg:border-s border-white/20">
            <img src={heroImage} alt={merchant.business_name} className="w-full max-w-[480px] aspect-square object-contain drop-shadow-2xl" />
          </div>
        </section>

        <section id="collection" className="max-w-[1600px] mx-auto px-5 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-xs tracking-[0.18em] uppercase text-white/40">Collection Tech</h2>
            <span className="text-xs font-mono text-white/40">{products?.length || 0} produits</span>
          </div>
          {products && products.length ? (
            <StorefrontClient products={products as never} subdomain={subdomain} merchantSubdomain={merchant.subdomain} />
          ) : (
            <div className="text-center py-16 border border-dashed border-white/20 bg-white/[0.03] text-sm text-white/60">Aucun produit</div>
          )}
        </section>
        <footer className="border-t border-white/20 py-6 text-center text-xs font-mono text-white/40">© {merchant.business_name} — ORDELY</footer>
      </div>
    );
  }

  if (cfg.template === "digital") {
    return (
      <div className="min-h-screen bg-[#F6F7FF] text-[#111]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap');`}</style>
        {cfg.show_shipping !== false && (
          <div className="h-[28px] bg-[#111] text-white flex items-center justify-center text-[10px] tracking-[0.18em] uppercase font-bold">
            {cfg.announcement || "LICENCES OFFICIELLES — LIVRAISON INSTANTANÉE — SUPPORT 24/7"}
          </div>
        )}
        <header className="sticky top-0 z-40 h-[64px] flex justify-between items-center px-5 lg:px-8 bg-white/90 backdrop-blur border-b border-[#E8EAF6]">
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.14em] font-bold">
            {merchant.logo_url && <img src={merchant.logo_url} alt={merchant.business_name} className="w-7 h-7 rounded object-cover border border-[#E8EAF6] bg-white" />}
            <span>{merchant.business_name}</span>
          </div>
          <div className="text-xs font-mono opacity-60">{products?.length || 0} licences</div>
        </header>

        {/* Hero Digital — light, license-focused, brand customizable */}
        <section className="grid lg:grid-cols-[1.05fr_0.95fr] min-h-[78vh] border-b border-[#E8EAF6] max-w-[1600px] mx-auto">
          <div className="px-5 lg:px-12 py-10 lg:py-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E8EAF6] rounded-full px-3 py-1 text-[10px] tracking-[0.14em] uppercase font-bold w-fit">
              <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" /> Licence officielle • Livraison instantanée
            </div>
            <h1 className="mt-6 text-[10vw] lg:text-[4.6vw] leading-[0.9] tracking-[-0.04em] font-black break-words">
              <span className="block">{merchant.business_name}</span>
            </h1>
            <p className="mt-5 max-w-[420px] text-sm leading-relaxed opacity-60">{merchant.description || "Produits numériques premium — comptes, logiciels, abonnements. Clé livrée instantanément après paiement, support 24/7."}</p>
            <div className="mt-8 flex gap-3">
              <a href="#collection" className="h-[46px] px-7 bg-[#111] text-white font-mono text-xs tracking-[0.14em] uppercase font-bold inline-flex items-center hover:bg-black">Explorer les licences</a>
              <span className="self-center text-xs opacity-40 font-mono">{products?.length || 0} produits</span>
            </div>
            <div className="mt-8 flex gap-6 text-[10px] tracking-[0.12em] uppercase opacity-40 font-mono">
              <span>WINDOWS • MACOS</span><span>•</span><span>INSTANT DELIVERY</span>
            </div>
          </div>
          <div className="relative bg-[#EEF0FF] flex items-center justify-center p-8 lg:p-10 min-h-[380px] border-t lg:border-t-0 lg:border-s border-[#E8EAF6]">
            <div className="w-full max-w-[520px] bg-white rounded-2xl border border-[#E8EAF6] shadow-xl overflow-hidden">
              <div className="h-9 flex items-center gap-1.5 px-4 border-b border-[#E8EAF6] bg-[#FAFAFF]">
                <span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-[11px] font-mono opacity-40">licence — {merchant.business_name}</span>
              </div>
              <img src={heroImage} alt={merchant.business_name} className="w-full aspect-[16/10] object-cover" />
              <div className="p-4 flex items-center justify-between">
                <div className="text-xs font-mono opacity-60">LICENCE KEY ••••• ••••• •••••</div>
                <div className="text-xs font-bold bg-[#111] text-white px-3 py-1.5 rounded-full">Activer</div>
              </div>
            </div>
          </div>
        </section>

        <section id="collection" className="max-w-[1600px] mx-auto px-5 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-xs tracking-[0.18em] uppercase opacity-40">Licences Digitales</h2>
            <span className="text-xs font-mono opacity-40">{products?.length || 0} produits</span>
          </div>
          {products && products.length ? (
            <StorefrontClient products={products as never} subdomain={subdomain} merchantSubdomain={merchant.subdomain} />
          ) : (
            <div className="text-center py-16 border border-dashed border-[#E8EAF6] bg-white text-sm opacity-60">Aucun produit numérique</div>
          )}
        </section>
        <footer className="border-t border-[#E8EAF6] py-6 text-center text-xs font-mono opacity-40 bg-white">© {merchant.business_name} — ORDELY</footer>
      </div>
    );
  }

  if (cfg.template === "beauty") {
    const beautyNameParts = merchant.business_name.split(" ");
    const beautyFirst = beautyNameParts[0] || "Maison";
    const beautyRest = beautyNameParts.slice(1).join(" ") || "Terre";
    return (
      <div className="min-h-screen" style={{ background: "#F8F5F0", color: "#2B2A28" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
.serif{font-family:'Fraunces',serif}
.beauty-top{height:32px;background:#2B2A28;color:#F8F5F0;display:flex;align-items:center;justify-content:center;font-size:10px;letter-spacing:.14em;text-transform:uppercase}
.beauty-head{position:sticky;top:0;z-index:40;height:68px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;background:rgba(248,245,240,.86);backdrop-filter:blur(18px);border-bottom:1px solid #E8E0D5}
@media(min-width:1024px){.beauty-head{padding:0 36px}}
.beauty-logo{font-family:'Fraunces',serif;font-size:18px;letter-spacing:-.02em;font-weight:500;display:flex;align-items:center;gap:10px}
.beauty-logo em{font-style:italic;color:#C47A5A}
.beauty-hero{display:grid;min-height:88vh;border-bottom:1px solid #E8E0D5;overflow:hidden}
@media(min-width:1024px){.beauty-hero{grid-template-columns:1fr 1.05fr}}
.beauty-left{padding:36px 20px 40px;display:flex;flex-direction:column;justify-content:center;background:#F8F5F0}
@media(min-width:1024px){.beauty-left{padding:64px 48px}}
.beauty-kicker{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8A7F75;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.beauty-kicker span{width:28px;height:1px;background:#C47A5A;display:inline-block}
.beauty-title{font-family:'Fraunces',serif;font-size:13vw;line-height:.9;letter-spacing:-.04em;font-weight:400}
@media(min-width:1024px){.beauty-title{font-size:5.2vw}}
.beauty-title em{font-style:italic;color:#C47A5A}
.beauty-sub{margin-top:16px;max-width:380px;font-size:14px;line-height:1.65;color:#6B655E}
.beauty-benefits{margin-top:24px;display:flex;gap:18px;flex-wrap:wrap}
.beauty-benefit{display:flex;gap:8px;align-items:center;font-size:11px;color:#6B655E}
.beauty-benefit .ic{width:28px;height:28px;border-radius:50%;background:#EDE8E0;display:flex;align-items:center;justify-content:center;font-size:12px}
.beauty-cta{margin-top:28px;display:flex;gap:12px}
.beauty-btnPrimary{height:48px;padding:0 26px;background:#2B2A28;color:#F8F5F0;border:none;border-radius:999px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;cursor:pointer;display:inline-flex;align-items:center}
.beauty-btnGhost{height:48px;padding:0 22px;background:none;color:#2B2A28;border:1px solid #E8E0D5;border-radius:999px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center}
.beauty-right{position:relative;background:#EDE8E0;display:flex;align-items:center;justify-content:center;padding:20px;min-height:480px;overflow:hidden}
@media(min-width:1024px){.beauty-right{min-height:auto;padding:36px}}
.beauty-right img.beauty-hero-img{width:100%;height:100%;object-fit:cover;border-radius:24px}
.beauty-float{position:absolute;bottom:28px;left:28px;background:#FEFEFD;border-radius:16px;padding:12px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 12px 32px rgba(43,42,40,.12);border:1px solid #E8E0D5}
.beauty-label{display:flex;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #E8E0D5;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#8A7F75;background:#F8F5F0}
@media(min-width:1024px){.beauty-label{padding:14px 36px}}
.beauty-grid{display:grid;grid-template-columns:1fr 1fr;background:#E8E0D5;gap:1px;border-bottom:1px solid #E8E0D5}
@media(min-width:1024px){.beauty-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
.beauty-card{background:#FEFEFD;cursor:pointer;display:flex;flex-direction:column;overflow:hidden}
.beauty-card-img{background:#F6F1E8;display:flex;align-items:center;justify-content:center;aspect-ratio:1/1;padding:20px;overflow:hidden;position:relative}
.beauty-card-img img{width:100%;height:100%;object-fit:cover;border-radius:18px;transition:transform .7s cubic-bezier(.16,1,.3,1)}
.beauty-card:hover .beauty-card-img img{transform:scale(1.04)}
.beauty-badge{position:absolute;top:14px;left:14px;background:#2B2A28;color:#FEFEFD;font-size:9px;letter-spacing:.12em;text-transform:uppercase;padding:6px 10px;border-radius:999px}
.beauty-body{padding:14px 16px 16px;flex:1;display:flex;flex-direction:column}
.beauty-name{font-family:'Fraunces',serif;font-size:14px;line-height:1.25}
.beauty-subname{font-size:11px;color:#8A7F75;margin-top:2px}
.beauty-ing{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}
.beauty-ing span{font-size:8.5px;padding:4px 8px;background:#F6F1E8;border:1px solid #EDE8E0;border-radius:999px;color:#6B655E}
.beauty-priceRow{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
.beauty-price{font-size:13px;font-weight:600}
.beauty-btnBuy{font-size:10px;letter-spacing:.1em;text-transform:uppercase;background:#F6F1E8;border:1px solid #EDE8E0;border-radius:999px;padding:8px 14px;cursor:pointer}
`}</style>
        {cfg.show_shipping !== false && <div className="beauty-top">{cfg.announcement || "Livraison 58 Wilayas — Paiement à la livraison — Naturel & fait main — Retour 14 jours"}</div>}
        <div className="beauty-head">
          <div className="beauty-logo">
            {merchant.logo_url && <img src={merchant.logo_url} alt={merchant.business_name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", border: "1px solid #E8E0D5" }} />}
            <span>{beautyFirst} <em>{beautyRest}</em></span>
          </div>
          <span style={{ fontSize: 11, letterSpacing: ".1em", opacity: .6 }}>{products?.length || 0} soins</span>
        </div>

        {/* Hero exact as Consumable-Beauty-General.html */}
        <section className="beauty-hero">
          <div className="beauty-left">
            <div className="beauty-kicker"><span></span> 100% Naturel — Fabriqué en Algérie — Depuis 2019</div>
            <div className="beauty-title">Des soins qui <em>sentent</em> la terre d&apos;Algérie.</div>
            <div className="beauty-sub">{merchant.description || "Formulés à Alger, avec huile d'olive de Kabylie, miel de montagne, argan. Sans sulfate, sans parfum ajouté."}</div>
            <div className="beauty-benefits">
              <div className="beauty-benefit"><div className="ic">♡</div> Naturel 98%</div>
              <div className="beauty-benefit"><div className="ic">◆</div> Fabriqué à Alger</div>
              <div className="beauty-benefit"><div className="ic">✿</div> Cruelty free</div>
            </div>
            <div className="beauty-cta">
              <a href="#shop" className="beauty-btnPrimary">Découvrir la collection</a>
              <a href="#shop" className="beauty-btnGhost">Notre histoire</a>
            </div>
          </div>
          <div className="beauty-right">
            <img className="beauty-hero-img" src={heroImage} alt={merchant.business_name} />
            {products && products[0] && (
              <div className="beauty-float">
                <img src={products[0].image_url || heroImage} alt={products[0].name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "Fraunces, serif" }}>{products[0].name}</div>
                  <div style={{ fontSize: 10, color: "#8A7F75" }}>{Number(products[0].price).toLocaleString("fr-DZ")} DA</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="beauty-label"><span>Collection / 04 — En stock</span><span>Livraison 24/48H — 58 Wilayas</span></div>

        {/* Grid exact — beauty cards with proper links (no window in server component) */}
        <section id="shop" className="beauty-grid">
          {products && products.length ? (
            products.slice(0,8).map((p:any)=>(
              <a key={p.id} href={`/${merchant.subdomain}/p/${p.slug}`} className="beauty-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="beauty-card-img">
                  <span className="beauty-badge">Naturel</span>
                  <img src={p.image_url || heroImage} alt={p.name} loading="lazy" />
                </div>
                <div className="beauty-body">
                  <div className="beauty-name">{p.name}</div>
                  <div className="beauty-subname">{p.description?.slice(0,40) || "Soin naturel"}</div>
                  <div className="beauty-ing">{(p.name.split(" ").slice(0,3) as string[]).map((t:string)=><span key={t}>{t}</span>)}</div>
                  <div className="beauty-priceRow"><div className="beauty-price">{Number(p.price).toLocaleString("fr-DZ")} DA</div><span className="beauty-btnBuy">Ajouter</span></div>
                </div>
              </a>
            ))
          ) : (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, background: "#FEFEFD", fontSize: 12, color: "#8A7F75" }}>Aucun soin — ajoutez votre premier produit</div>
          )}
        </section>

        <div className="beauty-label"><span>© 2026 {merchant.business_name} — Alger</span><span>Paiement à la livraison — Retour 14 jours</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap'); .font-serif{font-family:'Instrument Serif',serif;} .marquee{animation:marquee 28s linear infinite;} @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      {cfg.show_shipping !== false && (
        <div className="h-[36px] w-full border-b border-[#E8E6E1] bg-[#FAF9F6] flex items-center overflow-hidden">
          <div className="flex w-[200%] marquee">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="whitespace-nowrap text-[10px] tracking-[0.18em] uppercase font-medium px-8">
                {cfg.announcement || "LIVRAISON GRATUITE 58 WILAYAS — PAIEMENT À LA LIVRAISON — RETOURS 14 JOURS — ATELIER ALG NO.04"}
              </span>
            ))}
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/80 backdrop-blur border-b border-[#E8E6E1] h-[56px] flex items-center">
        <div className="w-full max-w-[1600px] mx-auto px-5 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {merchant.logo_url && <img src={merchant.logo_url} alt={merchant.business_name} className="w-8 h-8 rounded object-cover border border-[#E8E6E1] bg-white" />}
            <div className="font-serif text-[17px] tracking-[-0.02em]">{merchant.business_name}</div>
          </div>
          <div className="text-[11px] tracking-[0.12em] uppercase opacity-60">{products?.length || 0} produits</div>
        </div>
      </header>
      {/* Hero exact as Desktop file */}
      <section className="relative w-full border-b border-[#E8E6E1] overflow-hidden">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-92px)]">
          <div className="w-full lg:w-[50%] px-5 lg:px-8 pt-10 lg:pt-[9vh] pb-8 flex flex-col justify-between">
            <div>
              <div className="font-serif leading-[0.9] tracking-[-0.03em] text-[13vw] lg:text-[7vw]">
                <div className="overflow-hidden"><span className="block">NOUVELLE</span></div>
                <div className="overflow-hidden flex items-center gap-3"><span className="text-[8vw] lg:text-[4vw] font-light opacity-20">/</span><span className="block">COLLECTION</span></div>
                <div className="overflow-hidden flex items-center gap-3"><span className="text-[8vw] lg:text-[4vw] font-light opacity-20">/</span><span className="block">NO. 04</span></div>
              </div>
              <div className="mt-8 flex gap-8 text-[10px] leading-relaxed tracking-[0.08em] uppercase opacity-60 max-w-md">
                <div className="w-[1px] h-12 bg-[#111] opacity-10 hidden sm:block" />
                <div>
                  DISPONIBLE À ALGER, ORAN,<br />CONSTANTINE — LIVRAISON<br />24/48H. ÉDITION LIMITÉE,<br />FABRICATION ATELIER.
                </div>
              </div>
            </div>
            <div className="mt-10 flex gap-6 text-[10px] tracking-[0.12em] uppercase opacity-50">
              <span>FW26</span><span>•</span><span>58 WILAYAS</span><span>•</span><span>PAY ON DELIVERY</span>
            </div>
          </div>
          <div className="w-full lg:w-[50%] bg-[#EDEBE6] border-t lg:border-t-0 lg:border-s border-[#E8E6E1] relative overflow-hidden">
            <img src={heroImage} alt={merchant.business_name} className="w-full h-[60vh] lg:h-full lg:min-h-[calc(100vh-92px)] object-cover" />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium border border-[#E8E6E1]">DROP NO.04 — LOOK 01</div>
          </div>
        </div>
      </section>

      {/* Products — below hero, click opens side drawer */}
      <section className="max-w-[1600px] mx-auto px-5 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl">Collection</h2>
          <span className="text-xs tracking-[0.12em] uppercase opacity-50">{products?.length || 0} produits</span>
        </div>
        {products && products.length ? (
          <StorefrontClient products={products as never} subdomain={subdomain} merchantSubdomain={merchant.subdomain} />
        ) : (
          <div className="text-center py-16 border border-dashed border-[#E8E6E1] bg-white">
            <p className="text-sm opacity-60">Aucun produit — ajoutez votre premier produit</p>
          </div>
        )}
      </section>

      <footer className="border-t border-[#E8E6E1] py-6 text-center text-xs opacity-50">© {merchant.business_name} — ORDELY</footer>
    </div>
  );
}
