import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getStoreConfig } from "@/lib/store-config";
import TemplateAtelier from "@/components/landing/TemplateAtelier";
import TemplateTech from "@/components/landing/TemplateTech";
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

  const { data: merchant } = await supabaseAdmin.from("merchants").select("id, business_name, subdomain, phone, logo_url, description, primary_color, banner_url").eq("subdomain", subdomain).single();
  if (!merchant) return notFound();

  const { data: product } = await supabaseAdmin.from("products").select("*").eq("merchant_id", merchant.id).eq("slug", slug).eq("is_active", true).single();
  if (!product) return notFound();

  const cfg = await getStoreConfig(merchant.id);

  if (cfg.template === "tech") {
    return <TemplateTech product={product as never} merchant={merchant as never} config={cfg as never} />;
  }

  return <TemplateAtelier product={product as never} merchant={merchant as never} config={cfg as never} />;
}
