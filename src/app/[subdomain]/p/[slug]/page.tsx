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
    <div className="min-h-screen bg-background">
      <header className="border-b border-card bg-card sticky top-0 z-10" style={{ borderColor: merchant.primary_color || "var(--primary)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {merchant.logo_url ? <img src={merchant.logo_url} alt={merchant.business_name} className="w-10 h-10 rounded-xl object-cover border border-card" /> : <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg">{merchant.business_name[0]}</div>}
            <div>
              <div className="font-bold text-foreground text-lg">{merchant.business_name}</div>
              {merchant.description && <div className="text-sm text-muted-soft font-medium line-clamp-1">{merchant.description}</div>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-soft bg-card/20 border border-border rounded-full px-3 py-1.5" dir="ltr">{merchant.phone}</div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10 items-start">
        <div className="bg-card rounded-2xl border border-card overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-[420px] object-cover" />
          ) : (
            <div className="h-[420px] bg-card/5 flex flex-col items-center justify-center gap-3 border-b border-card/20">
              <IconPackage className="w-10 h-10 text-primary" />
              <span className="text-sm text-muted-soft">بدون صورة</span>
            </div>
          )}
          <div className="p-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{product.name}</h1>
            {product.description && <p className="text-sm text-muted-soft mt-4 leading-relaxed">{product.description}</p>}
            <div className="mt-6 flex items-baseline gap-4">
              <span className="text-3xl font-extrabold text-foreground">{product.price.toLocaleString("fr-DZ")} <span className="text-lg text-muted-soft">دج</span></span>
              {product.compare_at_price && <span className="line-through text-muted-soft font-bold">{Number(product.compare_at_price).toLocaleString("fr-DZ")} دج</span>}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold"><IconShield className="w-4 h-4" /> دفع عند الاستلام</span>
              <span className="inline-flex items-center gap-2 bg-card border border-card rounded-full px-4 py-2 rounded-full text-sm font-bold text-primary"><IconTruck className="w-4 h-4" /> توصيل 58 ولاية</span>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="bg-card rounded-2xl border border-card p-7 shadow-sm">
            <h2 className="text-2xl font-extrabold text-foreground">اطلب الآن</h2>
            <p className="text-sm text-muted-soft font-medium mt-1">املأ بياناتك وسيتصل بك فريق التأكيد قريباً — دفع عند الاستلام</p>
            <div className="mt-5">
              <CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-10">
        <Reviews productId={product.id} merchantId={merchant.id} />
      </div>

      <footer className="border-t border-card bg-background py-10 text-center">
        <div className="text-sm font-bold text-foreground">© {merchant.business_name}</div>
        <div className="text-sm text-muted-soft mt-1">مدعوم من <span className="font-bold">COD DZ</span> — منصة جزائرية</div>
      </footer>
    </div>
  );
}