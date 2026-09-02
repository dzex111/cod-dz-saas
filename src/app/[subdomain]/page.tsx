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
        <div className="h-[28px] bg-[#EDEDED] text-[#0B0B0C] flex items-center justify-center text-[10px] tracking-[0.18em] uppercase font-bold">
          {cfg.announcement || "LIVRAISON 58 WILAYAS — PAIEMENT À LA LIVRAISON — GARANTIE 12 MOIS"}
        </div>
        <header className="sticky top-0 z-40 h-[64px] flex justify-between items-center px-5 lg:px-8 bg-[rgba(11,11,12,0.9)] backdrop-blur border-b border-white/10">
          <div className="font-mono text-xs tracking-[0.14em]">NOVA <span className="opacity-40">TECH</span> — {merchant.business_name}</div>
          <div className="text-xs font-mono opacity-60">{products?.length || 0} produits</div>
        </header>
        <section className="max-w-[1600px] mx-auto px-5 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-xs tracking-[0.18em] uppercase opacity-40">Collection Tech</h2>
            <span className="text-xs font-mono opacity-40">{products?.length || 0} produits</span>
          </div>
          {products && products.length ? (
            <StorefrontClient products={products as never} subdomain={subdomain} merchantSubdomain={merchant.subdomain} />
          ) : (
            <div className="text-center py-16 border border-dashed border-white/10 bg-white/[0.03] text-sm opacity-60">Aucun produit</div>
          )}
        </section>
        <footer className="border-t border-white/10 py-6 text-center text-xs font-mono opacity-40">© {merchant.business_name} — NOVA TECH</footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap'); .font-serif{font-family:'Instrument Serif',serif;} .marquee{animation:marquee 28s linear infinite;} @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div className="h-[36px] w-full border-b border-[#E8E6E1] bg-[#FAF9F6] flex items-center overflow-hidden">
        <div className="flex w-[200%] marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap text-[10px] tracking-[0.18em] uppercase font-medium px-8">
              {cfg.announcement || "LIVRAISON GRATUITE 58 WILAYAS — PAIEMENT À LA LIVRAISON — RETOURS 14 JOURS — ATELIER ALG NO.04"}
            </span>
          ))}
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/80 backdrop-blur border-b border-[#E8E6E1] h-[56px] flex items-center">
        <div className="w-full max-w-[1600px] mx-auto px-5 lg:px-8 flex items-center justify-between">
          <div className="font-serif text-[17px] tracking-[-0.02em]">ATELIER <span className="opacity-40">/</span> ALG</div>
          <div className="text-[11px] tracking-[0.12em] uppercase opacity-60">{merchant.business_name}</div>
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
