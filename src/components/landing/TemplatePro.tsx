"use client";
import { useState } from "react";
import CheckoutForm from "@/app/[subdomain]/p/[slug]/CheckoutForm";
import Reviews from "@/app/[subdomain]/p/[slug]/Reviews";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
};
type Merchant = {
  id: string;
  business_name: string;
  subdomain: string;
  phone: string | null;
  logo_url: string | null;
  description: string | null;
};
type Config = {
  primary_color: string;
  accent_color: string;
  hero_title?: string;
  hero_subtitle?: string;
  announcement?: string;
  badge_text?: string;
  features?: { title: string; desc: string }[];
  benefits?: string[];
  faq?: { q: string; a: string }[];
  cta_text?: string;
  show_reviews: boolean;
  show_features: boolean;
  show_shipping: boolean;
  footer_text?: string;
};

export default function TemplatePro({ product, merchant, config }: { product: Product; merchant: Merchant; config: Config }) {
  const [activeImg, setActiveImg] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const primary = config.primary_color || "#2563EB";
  const images = [product.image_url, product.image_url, product.image_url].filter(Boolean) as string[];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement */}
      {config.announcement && (
        <div className="bg-ink text-white text-center text-xs font-medium py-2 px-4">
          {config.announcement}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {merchant.logo_url ? (
              <img src={merchant.logo_url} alt={merchant.business_name} className="w-9 h-9 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold" style={{ background: primary }}>{merchant.business_name[0]}</div>
            )}
            <span className="font-bold text-sm">{merchant.business_name}</span>
            <span className="hidden sm:inline text-xs text-muted border border-border rounded-full px-2 py-0.5">ORDELY</span>
          </div>
          <div className="flex items-center gap-3">
            {merchant.phone && <span className="hidden md:inline text-xs font-mono border border-border rounded-full px-3 py-1.5 bg-subtle" dir="ltr">{merchant.phone}</span>}
            <a href="#order" className="hidden sm:inline-flex bg-primary text-white text-sm font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-opacity" style={{ background: primary }}>اطلب الآن</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-8 lg:py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden group">
            {hasImages ? (
              <div className="relative aspect-[4/3] overflow-hidden bg-subtle">
                <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute top-3 left-3 bg-card border border-border rounded-full px-3 py-1 text-xs font-medium shadow-sm">{config.badge_text || "الأكثر طلباً"}</div>
                <div className="absolute bottom-3 right-3 bg-ink text-white text-xs px-2 py-1 rounded-full opacity-90">{activeImg + 1} / {images.length}</div>
              </div>
            ) : (
              <div className="aspect-[4/3] bg-subtle flex items-center justify-center text-muted">لا توجد صورة</div>
            )}
          </div>
          {hasImages && (
            <div className="grid grid-cols-3 gap-3">
              {images.slice(0, 3).map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? "border-primary shadow-sm" : "border-border hover:border-border-strong opacity-80 hover:opacity-100"}`} style={{ borderColor: activeImg === i ? primary : undefined }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {/* Features below gallery */}
          {config.show_features && config.features && (
            <div className="grid grid-cols-3 gap-3">
              {config.features.map((f) => (
                <div key={f.title} className="bg-card border border-border rounded-xl p-3 text-center hover:shadow-sm hover:border-primary/20 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="text-xs font-semibold mt-2">{f.title}</div>
                  <div className="text-xs text-muted mt-1 leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info + Form */}
        <div className="lg:sticky lg:top-[80px] space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-success/10 text-success border border-success/20 px-2 py-1 rounded-full font-medium">في المخزون</span>
              <span className="text-muted">•</span>
              <span className="text-muted">58 ولاية</span>
            </div>
            <h1 className="text-2xl font-bold leading-tight mt-3">{config.hero_title || product.name}</h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">{config.hero_subtitle || product.description || "جودة عالية، تغليف آمن، توصيل سريع."}</p>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: primary }}>{product.price.toLocaleString("fr-DZ")} DZD</span>
              {product.compare_at_price && (
                <>
                  <span className="text-sm text-muted line-through">{Number(product.compare_at_price).toLocaleString("fr-DZ")} DZD</span>
                  <span className="text-xs bg-danger/10 text-danger border border-danger/20 px-2 py-1 rounded-full font-medium">
                    -{Math.round((1 - product.price / Number(product.compare_at_price)) * 100)}%
                  </span>
                </>
              )}
            </div>

            {config.benefits && (
              <ul className="mt-4 space-y-2">
                {config.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center text-xs mt-0.5">✓</span>
                    <span className="text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex gap-2 text-xs">
              <span className="flex-1 bg-subtle border border-border rounded-lg px-3 py-2 text-center">الدفع عند الاستلام</span>
              <span className="flex-1 bg-subtle border border-border rounded-lg px-3 py-2 text-center">استرجاع 14 يوم</span>
            </div>
          </div>

          <div id="order" className="bg-card border border-border rounded-xl p-6 shadow-sm scroll-mt-[80px]">
            <h2 className="font-bold">اطلب الآن</h2>
            <p className="text-xs text-muted mt-1">املأ بياناتك — فريق التأكيد يتصل بك خلال ساعات</p>
            <div className="mt-4">
              <CheckoutForm merchantSubdomain={merchant.subdomain} productSlug={product.slug} price={product.price} />
            </div>
            <p className="text-xs text-muted text-center mt-3">معلوماتك محمية • للتواصل حول الطلب فقط</p>
          </div>

          {/* FAQ */}
          {config.faq && config.faq.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-sm">أسئلة شائعة</h3>
              <div className="mt-3 divide-y divide-border">
                {config.faq.map((f, i) => (
                  <button key={f.q} onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full text-right py-3 flex justify-between gap-4">
                    <span className="text-sm font-medium">{f.q}</span>
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 transition-colors ${faqOpen === i ? "bg-primary text-white border-primary" : "bg-subtle border-border"}`}>{faqOpen === i ? "−" : "+"}</span>
                  </button>
                ))}
              </div>
              {faqOpen !== null && <div className="text-sm text-muted mt-2 leading-relaxed">{config.faq[faqOpen].a}</div>}
            </div>
          )}
        </div>
      </section>

      {/* Social proof */}
      {config.show_reviews && (
        <section className="max-w-7xl mx-auto px-6 pb-10">
          <Reviews productId={product.id} merchantId={merchant.id} />
        </section>
      )}

      <footer className="border-t border-border bg-card py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="font-bold text-sm">ORDELY • {merchant.business_name}</div>
          <div className="text-xs text-muted mt-1">{config.footer_text || "كل طلب تحت السيطرة — ORDELY"}</div>
        </div>
      </footer>
    </div>
  );
}
