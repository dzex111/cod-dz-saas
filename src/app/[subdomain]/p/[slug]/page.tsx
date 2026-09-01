import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import Reviews from "./Reviews";
import { IconPackage, IconShield, IconTruck } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
import type { Metadata } from "next";

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

  const { data: merchant } = await supabaseAdmin.from("merchants").select("id, business_name, subdomain, phone, logo_url, description, primary_color").eq("subdomain", subdomain).single();
  if (!merchant) return notFound();

  const { data: product } = await supabaseAdmin.from("products").select("*").eq("merchant_id", merchant.id).eq("slug", slug).eq("is_active", true).single();
  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10" style={{ borderTop: `4px solid ${merchant.primary_color || "#18181b"}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-10 h-10 rounded-2xl object-cover border-2 border-zinc-200" /> : <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-black">{merchant.business_name[0]}</div>}
            <div>
              <div className="font-black text-zinc-900 dark:text-white text-lg">{merchant.business_name}</div>
              {merchant.description && <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium line-clamp-1">{merchant.description}</div>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full" dir="ltr">{merchant.phone}</div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10 items-start">
        <div className="bg-white rounded-3xl border-2 border-zinc-200 overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-[520px] object-cover" />
          ) : (
            <div className="h-[520px] bg-zinc-50 flex flex-col items-center justify-center gap-3 border-b-2 border-zinc-100">
              <IconPackage className="w-12 h-12 text-zinc-300" />
              <span className="text-sm font-bold text-zinc-500">بدون صورة</span>
            </div>
          )}
          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 leading-tight">{product.name}</h1>
            {product.description && <p className="text-zinc-700 mt-4 leading-8 text-[17px] font-medium">{product.description}</p>}
            <div className="mt-6 flex items-baseline gap-4">
              <span className="text-4xl font-black text-zinc-900">{product.price.toLocaleString("fr-DZ")} <span className="text-lg font-bold text-zinc-600">دج</span></span>
              {product.compare_at_price && <span className="line-through text-zinc-500 font-bold">{Number(product.compare_at_price).toLocaleString("fr-DZ")} دج</span>}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-bold"><IconShield className="w-4 h-4" /> دفع عند الاستلام</span>
              <span className="inline-flex items-center gap-2 bg-white border-2 border-zinc-200 px-4 py-2 rounded-full text-sm font-bold text-zinc-700"><IconTruck className="w-4 h-4" /> توصيل 58 ولاية</span>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border-2 border-zinc-200 p-7 shadow-sm">
            <h2 className="text-2xl font-black text-zinc-900">اطلب الآن</h2>
            <p className="text-sm text-zinc-600 font-medium mt-1">املأ بياناتك وسيتصل بك فريق التأكيد قريباً — دفع عند الاستلام</p>
            <div className="mt-5">
              <CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-10">
        <Reviews productId={product.id} merchantId={merchant.id} />
      </div>

      <footer className="border-t border-zinc-200 bg-zinc-50 py-10 text-center">
        <div className="text-sm font-bold text-zinc-900">© {merchant.business_name}</div>
        <div className="text-xs text-zinc-600 mt-1">مدعوم من <span className="font-black">COD DZ</span> — منصة جزائرية</div>
      </footer>
    </div>
  );
}
