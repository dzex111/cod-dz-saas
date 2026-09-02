import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import Reviews from "./Reviews";
import { IconPackage, IconShield, IconTruck } from "@/components/icons";
import { getStoreConfig } from "@/lib/store-config";
import TemplatePro from "@/components/landing/TemplatePro";
import TemplateAtelier from "@/components/landing/TemplateAtelier";
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

  if (cfg.template === "atelier") {
    return <TemplateAtelier product={product as never} merchant={merchant as never} config={cfg as never} />;
  }

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
            
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-10 items-start">
          <div className="relative overflow-hidden rounded-xl bg-zinc-900 border border-white/10">
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
                <div className="bg-white/5 border border-white/10 rounded-xl p-3"><IconShield className="w-6 h-6 mx-auto" /><div className="text-xs font-bold mt-1">دفع آمن</div></div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3"><IconTruck className="w-6 h-6 mx-auto" /><div className="text-xs font-bold mt-1">توصيل سريع</div></div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3"><IconPackage className="w-6 h-6 mx-auto" /><div className="text-xs font-bold mt-1">جودة مضمونة</div></div>
              </div>
            )}
            <div className="mt-8 bg-white text-zinc-900 rounded-xl p-6">
              <h2 className="font-black text-lg">اطلب الآن</h2>
              <p className="text-sm text-zinc-600 mt-1">الدفع عند الاستلام — سيتصل بك فريق التأكيد</p>
              <div className="mt-4"><CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} /></div>
            </div>
          </div>
        </div>
        {cfg.show_reviews && <div className="max-w-7xl mx-auto px-6 pb-10"><Reviews productId={product.id} merchantId={merchant.id} /></div>}
        <footer className="border-t border-white/10 py-8 text-center text-white/60 text-sm">{cfg.footer_text || `© ${merchant.business_name} — مدعوم من ORDELY`}</footer>
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
            
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-[#E8D9C5] overflow-hidden shadow-sm">
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
          <div className="bg-white rounded-xl border border-[#E8D9C5] p-6 shadow-sm h-fit lg:sticky lg:top-20">
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

  // DEFAULT: PRO — القالب الأول الاحترافي الحقيقي
  // Also handles "minimal" for backward compatibility
  return (
    <TemplatePro
      product={product as never}
      merchant={merchant as never}
      config={{
        primary_color: primary,
        accent_color: cfg.accent_color || "#0F172A",
        hero_title: cfg.hero_title,
        hero_subtitle: cfg.hero_subtitle,
        announcement: cfg.announcement,
        badge_text: cfg.badge_text,
        features: cfg.features,
        benefits: cfg.benefits,
        faq: cfg.faq,
        cta_text: cfg.cta_text,
        show_reviews: cfg.show_reviews,
        show_features: cfg.show_features,
        show_shipping: cfg.show_shipping,
        footer_text: cfg.footer_text,
      }}
    />
  );
}
