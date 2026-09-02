import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import Reviews from "./Reviews";
import { IconPackage, IconShield, IconTruck } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import { getStoreConfig } from "@/lib/store-config";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string; slug: string }> }): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const admin = createAdminClient();
  const { data: p } = await admin.from("products").select("name, description, price, image_url, merchants(business_name)").eq("slug", slug).maybeSingle();
  const merchantName = (p?.merchants as unknown as { business_name: string })?.business_name || subdomain;
  return {
    title: p ? `${p.name} - ${merchantName} | ${p.price} دج` : "منتج",
    description: p?.description?.slice(0, 150) || "دفع عند الاستلام — توصيل 58 ولاية",
    openGraph: { title: p?.name, description: p?.description?.slice(0, 120), images: p?.image_url ? [{ url: p.image_url }] : [], locale: "ar_DZ" },
  };
}

export default async function ProductLandingPage({ params }: { params: Promise<{ subdomain: string; slug: string }> }) {
  const { subdomain, slug } = await params;
  const supabaseAdmin = createAdminClient();

  const { data: merchant } = await supabaseAdmin.from("merchants").select("id, business_name, subdomain, phone, logo_url, description, primary_color, banner_url").eq("subdomain", subdomain).single();
  if (!merchant) return notFound();

  const { data: product } = await supabaseAdmin.from("products").select("*").eq("merchant_id", merchant.id).eq("slug", slug).eq("is_active", true).single();
  if (!product) return notFound();

  const cfg = await getStoreConfig(merchant.id);
  const primary = cfg.primary_color || merchant.primary_color || "#E53535";

  // Template: BOLD (dark hero)
  if (cfg.template === "bold") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        {cfg.announcement && <div className="bg-white text-zinc-900 text-center text-xs font-bold py-2 px-4">{cfg.announcement}</div>}
        <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href={`/${subdomain}`} className="flex items-center gap-3">
              {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-9 h-9 rounded-xl object-cover border border-white/10" /> : <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 flex items-center justify-center font-black">{merchant.business_name[0]}</div>}
              <span className="font-black">{merchant.business_name}</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-10 items-start">
          <div className="relative overflow-hidden rounded-[24px] bg-zinc-900 border border-white/10">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-[520px] object-cover" /> : <div className="h-[520px] flex items-center justify-center"><IconPackage className="w-12 h-12 text-white/20" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
          <div>
            <div className="inline-flex bg-white text-zinc-900 px-3 py-1 rounded-full text-xs font-black">دفع عند الاستلام • 58 ولاية</div>
            <h1 className="text-4xl font-black mt-4 leading-tight">{cfg.hero_title || product.name}</h1>
            <p className="text-white/70 mt-3 leading-7">{cfg.hero_subtitle || product.description}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-black" style={{ color: primary }}>{product.price.toLocaleString("fr-DZ")} دج</span>
              {product.compare_at_price && <span className="line-through text-white/40">{Number(product.compare_at_price).toLocaleString("fr-DZ")}</span>}
            </div>
            {cfg.show_features && (
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3"><IconShield className="w-6 h-6 mx-auto" /><div className="text-xs font-bold mt-1">دفع آمن</div></div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3"><IconTruck className="w-6 h-6 mx-auto" /><div className="text-xs font-bold mt-1">توصيل سريع</div></div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3"><IconPackage className="w-6 h-6 mx-auto" /><div className="text-xs font-bold mt-1">جودة مضمونة</div></div>
              </div>
            )}
            <div className="mt-8 bg-white text-zinc-900 rounded-[20px] p-6">
              <h2 className="font-black text-lg">اطلب الآن</h2>
              <p className="text-sm text-zinc-600 mt-1">الدفع عند الاستلام — سيتصل بك فريق التأكيد</p>
              <div className="mt-4"><CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} /></div>
            </div>
          </div>
        </div>
        {cfg.show_reviews && <div className="max-w-7xl mx-auto px-6 pb-10"><Reviews productId={product.id} merchantId={merchant.id} /></div>}
        <footer className="border-t border-white/10 py-8 text-center text-white/60 text-sm">{cfg.footer_text || `© ${merchant.business_name} — مدعوم من COD DZ`}</footer>
      </div>
    );
  }

  // Template: WARM
  if (cfg.template === "warm") {
    return (
      <div className="min-h-screen bg-[#FDF6EE]">
        {cfg.announcement && <div className="bg-[#111111] text-[#FDF6EE] text-center text-xs font-bold py-2">{cfg.announcement}</div>}
        <header className="bg-[#FDF6EE] border-b border-[#E8D9C5] sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href={`/${subdomain}`} className="flex items-center gap-3">
              {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-9 h-9 rounded-full object-cover border-2 border-[#E8D9C5]" /> : <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white" style={{ background: primary }}>{merchant.business_name[0]}</div>}
              <span className="font-black text-zinc-900">{merchant.business_name}</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[24px] border border-[#E8D9C5] overflow-hidden shadow-sm">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-[480px] object-cover" /> : <div className="h-[480px] bg-[#FDF6EE] flex items-center justify-center"><IconPackage className="w-10 h-10 text-zinc-400" /></div>}
            <div className="p-7">
              <h1 className="text-3xl font-black text-zinc-900">{cfg.hero_title || product.name}</h1>
              <p className="text-zinc-600 mt-3 leading-7">{cfg.hero_subtitle || product.description}</p>
              <div className="mt-5 flex gap-2">
                <span className="bg-[#111111] text-white px-4 py-2 rounded-full text-sm font-bold">{product.price.toLocaleString("fr-DZ")} دج</span>
                {cfg.show_shipping && <span className="bg-white border border-[#E8D9C5] px-4 py-2 rounded-full text-sm font-bold">توصيل 58 ولاية</span>}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[24px] border border-[#E8D9C5] p-6 shadow-sm h-fit lg:sticky lg:top-20">
            <h2 className="font-black text-xl">اطلب الآن بكل ود</h2>
            <p className="text-sm text-zinc-600 mt-1">نحن نهتم بك — الدفع عند الاستلام</p>
            <div className="mt-5"><CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} /></div>
          </div>
        </div>
        {cfg.show_reviews && <div className="max-w-7xl mx-auto px-6 pb-10"><Reviews productId={product.id} merchantId={merchant.id} /></div>}
        <footer className="py-8 text-center text-sm text-zinc-600">{cfg.footer_text || `© ${merchant.business_name} — متجر دافئ وودود`}</footer>
      </div>
    );
  }

  // DEFAULT: MINIMAL (professional)
  return (
    <div className="min-h-screen bg-background">
      {cfg.announcement && <div className="bg-ink text-white dark:bg-white dark:text-zinc-900 text-center text-xs font-bold py-2 px-4 tracking-wide">{cfg.announcement}</div>}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={`/${subdomain}`} className="flex items-center gap-3">
            {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-9 h-9 rounded-xl object-cover border border-border shadow-sm" /> : <div className="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center font-black text-sm">{merchant.business_name[0]}</div>}
            <div>
              <div className="font-black leading-none" style={{ color: primary }}>{merchant.business_name}</div>
              <div className="text-xs text-muted">دفع عند الاستلام • 58 ولاية</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {merchant.phone && <div className="hidden md:flex text-xs font-mono bg-background border border-border rounded-full px-3 py-1.5" dir="ltr">{merchant.phone}</div>}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8 items-start">
        <div className="bg-card rounded-[24px] border border-border overflow-hidden shadow-sm">
          {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-[500px] object-cover" /> : <div className="h-[500px] bg-card-hover flex items-center justify-center"><IconPackage className="w-10 h-10 text-muted-soft" /></div>}
          <div className="p-7">
            <h1 className="text-[28px] font-black leading-tight">{cfg.hero_title || product.name}</h1>
            <p className="text-[15px] text-muted mt-3 leading-7">{cfg.hero_subtitle || product.description}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-black" style={{ color: primary }}>{product.price.toLocaleString("fr-DZ")} دج</span>
              {product.compare_at_price && <span className="line-through text-muted-soft text-sm">{Number(product.compare_at_price).toLocaleString("fr-DZ")} دج</span>}
              {product.compare_at_price && <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs font-bold">تخفيض</span>}
            </div>
            {cfg.show_features && (
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold"><IconShield className="w-3.5 h-3.5" /> دفع عند الاستلام</span>
                <span className="inline-flex items-center gap-1.5 bg-background border border-border px-3.5 py-1.5 rounded-full text-xs font-bold"><IconTruck className="w-3.5 h-3.5" /> توصيل 58 ولاية</span>
                <span className="inline-flex items-center gap-1.5 bg-background border border-border px-3.5 py-1.5 rounded-full text-xs font-bold">✓ ضمان استرجاع</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-[88px] space-y-4">
          <div className="bg-card rounded-[24px] border border-border p-6 shadow-sm">
            <h2 className="text-xl font-black">اطلب الآن</h2>
            <p className="text-sm text-muted mt-1">املأ بياناتك وسيتصل بك فريق التأكيد — الدفع عند الاستلام</p>
            <div className="mt-5"><CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} /></div>
          </div>
          {cfg.show_shipping && (
            <div className="bg-background border border-border rounded-2xl p-4 text-xs leading-6">
              <div className="font-bold">🚚 توصيل سريع</div>
              <div className="text-muted">48 ولاية شمالية خلال 24-48 ساعة، الجنوب خلال 3 أيام. الدفع عند الاستلام.</div>
            </div>
          )}
        </div>
      </div>

      {cfg.show_reviews && <div className="max-w-7xl mx-auto px-6 pb-10"><Reviews productId={product.id} merchantId={merchant.id} /></div>}
      <footer className="border-t border-border bg-card py-8 text-center">
        <div className="text-sm font-bold">{cfg.footer_text || `© ${merchant.business_name}`}</div>
        <div className="text-sm text-muted mt-1">مدعوم من <span className="font-bold" style={{ color: primary }}>COD DZ</span> — منصة جزائرية</div>
      </footer>
    </div>
  );
}
