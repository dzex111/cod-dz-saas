import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { IconPackage, IconStore } from "@/components/icons";
import { getStoreConfig } from "@/lib/store-config";

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
  const { data: cats } = await supabaseAdmin.from("products").select("category").eq("merchant_id", merchant.id).not("category", "is", null);
  const categories = [...new Set((cats || []).map(c=>c.category).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap'); .font-serif{font-family:'Instrument Serif',serif;}`}</style>
      <div className="h-[36px] w-full border-b border-[#E8E6E1] bg-[#FAF9F6] flex items-center overflow-hidden">
        <div className="flex w-[200%] marquee will-change-transform" style={{ animation: "marquee 28s linear infinite" } as never}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap text-[10px] tracking-[0.18em] uppercase font-medium px-8">
              {cfg.announcement || "LIVRAISON GRATUITE 58 WILAYAS — PAIEMENT À LA LIVRAISON"}
            </span>
          ))}
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/80 backdrop-blur border-b border-[#E8E6E1] h-[56px] flex items-center">
        <div className="w-full max-w-[1600px] mx-auto px-5 lg:px-8 flex items-center justify-between">
          <div className="font-serif text-[17px] tracking-[-0.02em]">ATELIER <span className="opacity-40">/</span> ALG</div>
          <Link href="/" className="text-[11px] tracking-[0.12em] uppercase opacity-60 hover:opacity-100">ORDELY</Link>
        </div>
      </header>
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-8">
        <div className="text-center py-8 border-b border-[#E8E6E1] mb-8">
          <h1 className="font-serif text-4xl">{merchant.business_name}</h1>
          <p className="text-sm opacity-60 mt-2 max-w-xl mx-auto">{merchant.description || "Boutique officielle"}</p>
          <form className="mt-6 flex flex-wrap gap-2 max-w-3xl mx-auto justify-center">
            <input name="q" defaultValue={q || ""} placeholder="Rechercher..." className="flex-1 min-w-[220px] border border-[#E8E6E1] rounded-[4px] px-4 py-2.5 text-sm bg-white focus:border-[#111] outline-none" />
            <select name="cat" defaultValue={cat || ""} className="border border-[#E8E6E1] rounded-[4px] px-3 py-2.5 text-sm bg-white">
              <option value="">Toutes catégories</option>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <button className="px-6 bg-[#111] text-white rounded-[4px] text-sm hover:bg-black">Rechercher</button>
          </form>
        </div>

        {products && products.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <Link key={p.id} href={`/${subdomain}/p/${p.slug}`} className="group bg-white border border-[#E8E6E1] rounded-[4px] overflow-hidden hover:border-[#111] transition-colors">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-64 object-cover group-hover:scale-[1.01] transition duration-300" /> : <div className="h-64 bg-[#FAF9F6] flex items-center justify-center border-b border-[#E8E6E1]"><IconPackage className="w-8 h-8 opacity-30" /></div>}
                <div className="p-4">
                  <div className="font-serif text-sm">{p.name}</div>
                  <div className="text-sm font-medium mt-2">{p.price.toLocaleString("fr-DZ")} DZD</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-[#E8E6E1] rounded-[4px]">
            <IconStore className="w-8 h-8 mx-auto opacity-20" />
            <p className="font-medium mt-3">Aucun produit</p>
          </div>
        )}
      </div>
      <footer className="border-t border-[#E8E6E1] py-6 text-center text-xs opacity-50">{cfg.footer_text || `© ${merchant.business_name} — ORDELY`}</footer>
    </div>
  );
}
