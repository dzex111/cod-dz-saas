import { createClient } from "@supabase/supabase-js";

export type StoreTemplate = "minimal" | "bold" | "warm" | "pro" | "atelier";

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
  // Pro template extensions
  badge_text?: string;
  features?: { title: string; desc: string }[];
  benefits?: string[];
  faq?: { q: string; a: string }[];
  cta_text?: string;
};

export const DEFAULT_CONFIG: StoreConfig = {
  template: "pro",
  primary_color: "#2563EB",
  accent_color: "#0F172A",
  hero_title: "",
  hero_subtitle: "",
  announcement: "توصيل سريع لـ 58 ولاية • دفع عند الاستلام",
  show_reviews: true,
  show_features: true,
  show_shipping: true,
  footer_text: "",
  badge_text: "جديد • الأكثر طلباً",
  features: [
    { title: "دفع عند الاستلام", desc: "ادفع عند وصول الطلب لباب منزلك" },
    { title: "توصيل 58 ولاية", desc: "24-48 ساعة للشمال، 72 ساعة للجنوب" },
    { title: "ضمان استرجاع", desc: "14 يوم ضمان استرجاع بدون أسئلة" },
  ],
  benefits: ["جودة عالية مضمونة", "تغليف آمن", "دعم سريع عبر الهاتف"],
  faq: [
    { q: "كم يستغرق التوصيل؟", a: "الشمال 24-48 ساعة، الجنوب 2-3 أيام." },
    { q: "هل الدفع عند الاستلام؟", a: "نعم، تدفع عند استلام الطلب." },
    { q: "هل يمكن الإرجاع؟", a: "نعم خلال 14 يوم مع ضمان كامل." },
  ],
  cta_text: "اطلب الآن — الدفع عند الاستلام",
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
