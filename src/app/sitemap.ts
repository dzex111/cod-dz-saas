import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${process.env.NEXT_PUBLIC_BASE_DOMAIN || "ordely.com"}`;
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ];
  try {
    const admin = createAdminClient();
    const { data: merchants } = await admin.from("merchants").select("subdomain").limit(50);
    const { data: products } = await admin.from("products").select("slug, merchant_id, merchants(subdomain)").eq("is_active", true).limit(100);
    merchants?.forEach(m => urls.push({ url: `${base}/${m.subdomain}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 }));
    (products as unknown as Array<{ slug: string; merchants: { subdomain: string } }>)?.forEach(p => {
      if (p.merchants?.subdomain) urls.push({ url: `${base}/${p.merchants.subdomain}/p/${p.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 });
    });
  } catch {}
  return urls;
}
