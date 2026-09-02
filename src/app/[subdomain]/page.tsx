import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { IconPackage, IconStore } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
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
  const primary = cfg.primary_color || merchant.primary_color || "#E53535";

  let query = supabaseAdmin.from("products").select("*").eq("merchant_id", merchant.id).eq("is_active", true);
  if (q) query = query.ilike("name", `%${q}%`);
  if (cat) query = query.eq("category", cat);
  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  const { data: products } = await query.limit(24);
  const { data: cats } = await supabaseAdmin.from("products").select("category").eq("merchant_id", merchant.id).not("category", "is", null);
  const categories = [...new Set((cats || []).map(c=>c.category).filter(Boolean))] as string[];

  const grid = (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {products && products.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link key={p.id} href={`/${subdomain}/p/${p.slug}`} className="group bg-card rounded-[20px] border border-border overflow-hidden hover:shadow-lg hover:border-border-strong transition-all flex flex-col">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-56 object-cover group-hover:scale-[1.02] transition duration-300" /> : <div className="h-56 bg-card-hover flex items-center justify-center border-b border-border"><IconPackage className="w-10 h-10 text-muted-soft" /></div>}
              <div className="p-4 flex-1 flex flex-col">
                <div className="font-bold text-sm line-clamp-1">{p.name}</div>
                {p.category && <div className="text-xs text-muted-soft mt-1">#{p.category}</div>}
                <div className="text-lg font-black mt-2" style={{ color: cfg.template==="minimal" ? "var(--foreground)" : primary }}>{p.price.toLocaleString("fr-DZ")} <span className="text-xs text-muted">دج</span></div>
                <div className="mt-3 text-white text-center py-2.5 rounded-xl text-xs font-bold group-hover:opacity-90 transition" style={{ background: primary }}>عرض المنتج →</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-[24px] border border-dashed border-border">
          <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto mb-4"><IconStore className="w-8 h-8 text-muted-soft" /></div>
          <p className="font-bold">لا توجد منتجات حالياً</p>
          <p className="text-sm text-muted mt-1">سيظهر هنا كل منتجات هذا المتجر</p>
        </div>
      )}
    </div>
  );

  // BOLD template storefront
  if (cfg.template === "bold") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        {cfg.announcement && <div className="bg-white text-zinc-900 text-center text-xs font-black py-2">{cfg.announcement}</div>}
        <header className="border-b border-white/10 bg-zinc-900">
          <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/" className="text-xs font-bold text-white/60 hover:text-white">← ORDELY</Link>
            <ThemeToggle />
          </div>
          <div className="max-w-7xl mx-auto px-6 pb-10 text-center">
            {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-white/10" /> : <div className="w-20 h-20 rounded-2xl bg-white text-zinc-900 flex items-center justify-center mx-auto mb-4 font-black text-xl">{merchant.business_name[0]}</div>}
            <h1 className="text-4xl font-black">{merchant.business_name}</h1>
            <p className="text-white/60 mt-2 max-w-2xl mx-auto">{cfg.hero_subtitle || merchant.description}</p>
          </div>
        </header>
        {grid}
        <footer className="border-t border-white/10 py-6 text-center text-sm text-white/50">{cfg.footer_text || `© ${merchant.business_name} — bold theme`}</footer>
      </div>
    );
  }

  if (cfg.template === "warm") {
    return (
      <div className="min-h-screen bg-[#FDF6EE]">
        {cfg.announcement && <div className="bg-[#111111] text-[#FDF6EE] text-center text-xs font-bold py-2">{cfg.announcement}</div>}
        <header className="bg-white border-b border-[#E8D9C5]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/" className="text-xs font-bold text-zinc-600">← ORDELY</Link>
            <ThemeToggle />
          </div>
          <div className="max-w-7xl mx-auto px-6 pb-10 text-center">
            {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-[#E8D9C5]" /> : <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-black text-xl" style={{ background: primary }}>{merchant.business_name[0]}</div>}
            <h1 className="text-4xl font-black text-zinc-900">{merchant.business_name}</h1>
            <p className="text-zinc-600 mt-2 max-w-2xl mx-auto">{cfg.hero_subtitle || merchant.description}</p>
          </div>
        </header>
        {grid}
        <footer className="py-6 text-center text-sm text-zinc-500">{cfg.footer_text || `© ${merchant.business_name} — warm theme`}</footer>
      </div>
    );
  }

  // minimal
  return (
    <div className="min-h-screen bg-background">
      {cfg.announcement && <div className="bg-ink text-white dark:bg-white dark:text-zinc-900 text-center text-xs font-bold py-2">{cfg.announcement}</div>}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-xs font-bold text-muted hover:text-foreground">← ORDELY</Link>
          <ThemeToggle />
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-10 text-center">
          {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-border shadow-sm" /> : <div className="w-20 h-20 rounded-2xl bg-ink text-white flex items-center justify-center mx-auto mb-4 shadow-sm"><IconStore className="w-8 h-8" /></div>}
          <h1 className="text-4xl font-black tracking-tight">{merchant.business_name}</h1>
          <p className="text-muted mt-3 text-[15px] max-w-2xl mx-auto">{cfg.hero_subtitle || merchant.description}</p>
          <p className="text-muted-soft mt-3 text-xs font-mono" dir="ltr">{process.env.NEXT_PUBLIC_BASE_DOMAIN}/{merchant.subdomain}</p>
          <form className="mt-8 flex flex-wrap gap-2 max-w-3xl mx-auto justify-center">
            <input name="q" defaultValue={q || ""} placeholder="ابحث في المنتجات..." className="flex-1 min-w-[220px] border border-border rounded-xl px-4 py-3 text-sm bg-background placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
            <select name="cat" defaultValue={cat || ""} className="border border-border rounded-xl px-3 py-3 text-sm bg-background font-bold">
              <option value="">كل الفئات</option>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select name="sort" defaultValue={sort || ""} className="border border-border rounded-xl px-3 py-3 text-sm bg-background font-bold">
              <option value="">الأحدث</option>
              <option value="price_asc">الأرخص</option>
              <option value="price_desc">الأغلى</option>
            </select>
            <button className="px-7 text-white rounded-xl font-bold hover:opacity-90 transition shadow-sm" style={{ background: primary }}>بحث</button>
          </form>
        </div>
      </header>
      {grid}
      <footer className="border-t border-border bg-card py-6 text-center text-sm text-muted">{cfg.footer_text || `مدعوم من ORDELY — ${merchant.business_name}`}</footer>
    </div>
  );
}
