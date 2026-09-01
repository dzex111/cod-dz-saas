import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { IconPackage, IconStore } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params;
  const admin = createAdminClient();
  const { data: m } = await admin.from("merchants").select("business_name").eq("subdomain", subdomain).single();
  return {
    title: m ? `${m.business_name} | COD DZ` : "متجر | COD DZ",
    description: m ? `تسوق من ${m.business_name} — دفع عند الاستلام، توصيل 58 ولاية` : "متجر دفع عند الاستلام",
    openGraph: { title: m?.business_name, description: "دفع عند الاستلام — 58 ولاية", locale: "ar_DZ" },
  };
}

export default async function StorefrontHome({ params, searchParams }: { params: Promise<{ subdomain: string }>, searchParams: Promise<{ q?: string, sort?: string, cat?: string }> }) {
  const { subdomain } = await params;
  const { q, sort, cat } = await searchParams;
  const supabaseAdmin = createAdminClient();
  const { data: merchant } = await supabaseAdmin.from("merchants").select("id, business_name, subdomain, logo_url, description, primary_color").eq("subdomain", subdomain).single();
  if (!merchant) return notFound();

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
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800" style={{ borderTop: `5px solid ${merchant.primary_color || "#18181b"}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-10 text-center">
          {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-20 h-20 rounded-3xl object-cover mx-auto mb-4 border-2 border-zinc-200 shadow-sm" /> : <div className="w-20 h-20 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center mx-auto mb-4"><IconStore className="w-8 h-8" /></div>}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">{merchant.business_name}</h1>
          {merchant.description && <p className="text-zinc-700 dark:text-zinc-300 mt-3 text-lg font-medium max-w-3xl mx-auto leading-7">{merchant.description}</p>}
          <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-sm font-mono" dir="ltr">{process.env.NEXT_PUBLIC_BASE_DOMAIN || "coddz.com"}/{merchant.subdomain}</p>
          <form className="mt-8 flex flex-wrap gap-3 max-w-3xl mx-auto justify-center">
            <input name="q" defaultValue={q || ""} placeholder="ابحث في المنتجات..." className="flex-1 min-w-[220px] border-2 border-zinc-300 dark:border-zinc-700 rounded-2xl px-5 py-3 text-[15px] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:border-zinc-900 outline-none transition" />
            <select name="cat" defaultValue={cat || ""} className="border-2 border-zinc-300 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm bg-white dark:bg-zinc-900 font-bold">
              <option value="">كل الفئات</option>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select name="sort" defaultValue={sort || ""} className="border-2 border-zinc-300 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm bg-white dark:bg-zinc-900 font-bold">
              <option value="">الأحدث</option>
              <option value="price_asc">الأرخص</option>
              <option value="price_desc">الأغلى</option>
            </select>
            <button className="px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:bg-black dark:hover:bg-zinc-100 transition shadow-sm">بحث</button>
          </form>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {products && products.length ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-7">
            {products.map((p) => (
              <Link key={p.id} href={`/${subdomain}/p/${p.slug}`} className="group bg-white rounded-3xl border-2 border-zinc-200 overflow-hidden hover:border-zinc-300 hover:shadow-xl transition-all duration-200">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-64 object-cover group-hover:scale-[1.02] transition duration-300" /> : <div className="h-64 bg-zinc-50 flex items-center justify-center border-b-2 border-zinc-100"><IconPackage className="w-10 h-10 text-zinc-300" /></div>}
                <div className="p-5">
                  <div className="font-extrabold text-zinc-900 line-clamp-1">{p.name}</div>
                  {p.category && <div className="text-xs font-bold text-zinc-500 mt-1">#{p.category}</div>}
                  <div className="text-xl font-black text-zinc-900 mt-2">{p.price.toLocaleString("fr-DZ")} <span className="text-sm font-bold text-zinc-600">دج</span></div>
                  <div className="mt-4 bg-zinc-900 text-white text-center py-3 rounded-xl text-sm font-bold group-hover:bg-black transition">عرض المنتج</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-zinc-300">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4"><IconStore className="w-8 h-8 text-zinc-400" /></div>
            <p className="font-bold text-zinc-900">لا توجد منتجات حالياً</p>
            <p className="text-sm text-zinc-600 mt-1">سيظهر هنا كل منتجات هذا المتجر</p>
          </div>
        )}
      </div>
    </div>
  );
}
