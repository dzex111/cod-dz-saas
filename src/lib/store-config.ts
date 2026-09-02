import { createClient } from "@supabase/supabase-js";

export type StoreTemplate = "minimal" | "bold" | "warm";

export type StoreConfig = {
  template: StoreTemplate;
  primary_color: string;
  accent_color: string;
  hero_title?: string;
  hero_subtitle?: string;
  announcement?: string;
  show_reviews: boolean;
  show_features: boolean;
  show_shipping: boolean;
  footer_text?: string;
};

export const DEFAULT_CONFIG: StoreConfig = {
  template: "minimal",
  primary_color: "#E53535",
  accent_color: "#111111",
  hero_title: "",
  hero_subtitle: "",
  announcement: "توصيل سريع لـ 58 ولاية • دفع عند الاستلام",
  show_reviews: true,
  show_features: true,
  show_shipping: true,
  footer_text: "",
};

// Server side fetch (using service role)
export async function getStoreConfig(merchantId: string): Promise<StoreConfig> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(url, key);
    const { data } = await supabase.storage.from("store-configs").download(`${merchantId}.json`);
    if (!data) return DEFAULT_CONFIG;
    const text = await data.text();
    const json = JSON.parse(text);
    return { ...DEFAULT_CONFIG, ...json };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveStoreConfig(merchantId: string, config: StoreConfig) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // client side will use anon, server uses service role - caller must provide supabase client
  return config;
}
