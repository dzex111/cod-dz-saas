"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Template = "atelier" | "tech" | "digital" | "beauty";

type Config = {
  template: Template;
  primary_color: string;
  accent_color: string;
  hero_title: string;
  hero_subtitle: string;
  announcement: string;
  show_reviews: boolean;
  show_features: boolean;
  show_shipping: boolean;
  show_faq: boolean;
  show_specs: boolean;
  show_ingredients: boolean;
  footer_text: string;
  badge_text?: string;
  features?: { title: string; desc: string }[];
  benefits?: string[];
  faq?: { q: string; a: string }[];
  cta_text?: string;
  hero_subtitle_digital?: string;
  show_download_link?: boolean;
  download_text?: string;
  license_text?: string;
  cta_color?: string;
  font?: "geist" | "instrument" | "inter" | "cairo" | "tajawal" | "manrope";
  button_radius?: "pill" | "xl" | "lg" | "none";
};

const DEFAULT: Config = {
  template: "atelier",
  primary_color: "#111111",
  accent_color: "#111111",
  hero_title: "",
  hero_subtitle: "",
  announcement: "توصيل سريع لـ 58 ولاية • دفع عند الاستلام",
  show_reviews: true,
  show_features: true,
  show_shipping: true,
  show_faq: true,
  show_specs: true,
  show_ingredients: true,
  footer_text: "",
  badge_text: "جديد • الأكثر طلباً",
  features: [
    { title: "دفع عند الاستلام", desc: "ادفع عند وصول الطلب" },
    { title: "توصيل 58 ولاية", desc: "24-48 ساعة للشمال" },
    { title: "ضمان استرجاع", desc: "14 يوم ضمان" },
  ],
  benefits: ["جودة عالية", "تغليف آمن", "دعم سريع"],
  faq: [
    { q: "كم يستغرق التوصيل؟", a: "الشمال 24-48 ساعة، الجنوب 2-3 أيام." },
    { q: "هل الدفع عند الاستلام؟", a: "نعم." },
    { q: "هل يمكن الإرجاع؟", a: "نعم خلال 14 يوم." },
  ],
  cta_text: "اطلب الآن — الدفع عند الاستلام",
  cta_color: "#2B2A28",
  font: "geist",
  button_radius: "pill",
};

export default function StoreSettingsPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ business_name: "", description: "", primary_color: "#E53535", logo_url: "", banner_url: "" });
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"design" | "content" | "preview">("design");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
      if (!mem) return;
      setMerchantId(mem.merchant_id);
      const { data: m } = await supabase.from("merchants").select("business_name, description, primary_color, logo_url, banner_url, subdomain").eq("id", mem.merchant_id).single();
      if (m) {
        setForm({ business_name: m.business_name || "", description: m.description || "", primary_color: m.primary_color || "#E53535", logo_url: m.logo_url || "", banner_url: m.banner_url || "" });
        setSubdomain(m.subdomain);
        setConfig(c => ({ ...c, primary_color: m.primary_color || c.primary_color }));
      }
      // load store-config via API (bypass RLS)
      try {
        const r = await fetch(`/api/store-config?merchantId=${mem.merchant_id}`);
        const j = await r.json();
        if (j.config) setConfig(prev => ({ ...prev, ...j.config }));
      } catch {}
    })();
  }, []);

  async function uploadFile(file: File, type: "logo" | "banner"): Promise<string | null> {
    if (!merchantId) return null;
    if (file.size > 5*1024*1024) { alert("الحد 5MB"); return null; }
    const path = `${merchantId}/${type}-${Date.now()}-${file.name.replace(/\s+/g,"-")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { alert(error.message); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function save() {
    if (!merchantId) return;
    setSaving(true);
    // save merchants table
    const { error } = await supabase.from("merchants").update({
      business_name: form.business_name,
      description: form.description,
      primary_color: form.primary_color || config.primary_color,
      logo_url: form.logo_url || null,
      banner_url: form.banner_url || null,
    }).eq("id", merchantId);
    if (error) { setMsg(error.message); setSaving(false); return; }
    // save store-config via API (service role)
    const toSave = { ...config, primary_color: form.primary_color };
    const res = await fetch("/api/store-config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ merchantId, config: toSave }) });
    const jr = await res.json();
    if (!res.ok) { setMsg(jr.error || "فشل حفظ التصميم"); setSaving(false); return; }
    setMsg(" تم حفظ كل التخصيصات — متجرك تحدث فوراً");
    setSaving(false);
    setTimeout(()=>setMsg(""), 4000);
  }

  const templates: { id: Template; name: string; desc: string; img: string }[] = [
    { id: "atelier", name: "Atelier — للأزياء والملابس", desc: "مستوحى من Sales-Landing-Modern-Dz — فاخر، serif، مناسب للفاشن", img: "/templates/atelier.png" },
    { id: "tech", name: "Tech — للإلكترونيات والهواتف", desc: "مستوحى من Electronics-V4-Final.html — داكن، تقني، مناسب للهواتف", img: "/templates/tech.png" },
    { id: "digital", name: "Digital — للمنتجات الرقمية", desc: "مستوحى من Digital-Products-Landing.html — minimal، للبرمجيات والتطبيقات", img: "/templates/digital.png" },
    { id: "beauty", name: "Beauty — للجمال والعناية", desc: "مستوحى من Consumable-Beauty-General.html — طبيعي، فاخر، للصحة والجمال (كما هو تماماً)", img: "/templates/beauty.png" },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight">تخصيص المتجر — مثل شوبيفاي</h1>
          <p className="text-sm text-muted mt-1">اختر قالباً، غيّر الألوان، وتحكم في كل سكشن. التغيير يظهر فوراً في متجرك.</p>
        </div>
        {subdomain && <a href={`https://${process.env.NEXT_PUBLIC_BASE_DOMAIN}/${subdomain}`} target="_blank" className="hidden sm:inline-flex px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:opacity-90">معاينة المتجر ↗</a>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-border p-1.5 rounded-xl w-fit">
        {[
          { id: "design", label: "التصميم" },
          { id: "content", label: "المحتوى" },
          { id: "preview", label: "معاينة حية" },
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id as never)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${tab===t.id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="design" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-bold">اختر القالب</h3>
                  <p className="text-xs text-muted mt-1">معاينة كاملة بدون قص — تمرير أفقي يتسع لأي عدد من القوالب</p>
                </div>
                <span className="text-[11px] font-mono bg-primary text-white px-2 py-1 rounded-full">{templates.find(t=>t.id===config.template)?.name.split(" —")[0]}</span>
              </div>

              {/* معاينة كبيرة — بدون قص، عرض كامل */}
              {(() => { const sel = templates.find(t=>t.id===config.template) || templates[0]; return (
                <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm">
                  <div className="bg-[#F8F8F8] p-2">
                    <img src={sel.img} alt={sel.name} className="w-full h-auto max-h-[360px] object-contain object-top mx-auto block" loading="lazy" />
                  </div>
                  <div className="p-3 border-t border-border bg-card flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="font-black text-sm leading-tight">{sel.name}</div>
                      <div className="text-xs text-muted leading-relaxed mt-0.5 line-clamp-2">{sel.desc}</div>
                    </div>
                    <span className="shrink-0 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">مُختار</span>
                  </div>
                </div>
              ); })()}

              {/* شريط مصغرات أفقي — حل احترافي للقائمة الضخمة */}
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
                {templates.map(t=>(
                  <button key={t.id} onClick={()=>setConfig({...config, template: t.id})} className={`shrink-0 w-[148px] snap-start rounded-xl border-2 overflow-hidden text-right transition-all ${config.template===t.id ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border bg-background hover:border-border-strong"}`}>
                    <div className="relative h-[96px] overflow-hidden bg-white">
                      <img src={t.img} alt={t.name} className="w-full h-full object-cover object-top" loading="lazy" />
                      {config.template===t.id && <span className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none" />}
                      {config.template===t.id && <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">✓</span>}
                    </div>
                    <div className="p-2">
                      <div className={`text-xs font-black leading-tight truncate ${config.template===t.id ? "text-primary" : ""}`}>{t.name.split(" —")[0]}</div>
                      <div className="text-[10px] text-muted leading-tight truncate">{t.id}</div>
                    </div>
                  </button>
                ))}
                {/* خيار القالب المخصص — بالتواصل */}
                <button onClick={()=>{ const email="kinezedge@gmail.com"; const subject=encodeURIComponent(`طلب قالب مخصص - ${subdomain || "متجري"}`); const body=encodeURIComponent(`مرحبا، أريد قالب مخصص لمتجري ${subdomain || ""}\nنوع المنتجات: \nالستايل المطلوب: \n`); window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank"); }} className="shrink-0 w-[148px] snap-start rounded-xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary hover:to-primary hover:text-white hover:border-primary group flex flex-col items-center justify-center p-3 text-center transition-all">
                  <span className="w-8 h-8 rounded-full bg-primary text-white group-hover:bg-white group-hover:text-primary flex items-center justify-center text-sm transition-colors">✦</span>
                  <span className="text-xs font-black mt-2 leading-tight">قالب مخصص لك؟</span>
                  <span className="text-[10px] opacity-70 leading-tight mt-1">نصممه حسب علامتك</span>
                  <span className="mt-2 text-[10px] font-bold bg-primary text-white group-hover:bg-white group-hover:text-primary px-2.5 py-1 rounded-full transition-colors">تواصل →</span>
                </button>
              </div>
              <p className="text-[11px] text-muted">اسحب يمين/يسار لرؤية كل القوالب — المعاينة الكبيرة تعرض القالب كاملاً بدون قص من الجوانب (object-contain).</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-[#FFF7ED] p-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm shadow shrink-0">✦</div>
                <div>
                  <div className="text-sm font-black leading-tight">هل تريد قالب مخصص لعلامتك؟</div>
                  <div className="text-xs text-muted leading-relaxed mt-1">نصمم لك قالب 1:1 من أي تصميم تريده — HTML/Figma/صورة — ويرتبط تلقائياً بمتجرك ومنتجاتك. تواصل وخلال 48 ساعة يكون جاهز.</div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] bg-white border border-amber-200 px-2 py-1 rounded-full">Figma → قالب</span>
                    <span className="text-[10px] bg-white border border-amber-200 px-2 py-1 rounded-full">متجاوب 100%</span>
                    <span className="text-[10px] bg-white border border-amber-200 px-2 py-1 rounded-full">COD جاهز</span>
                  </div>
                </div>
              </div>
              <button onClick={()=>{ const email="kinezedge@gmail.com"; const subject=encodeURIComponent(`طلب قالب مخصص - ${subdomain || "متجري"}`); const body=encodeURIComponent(`مرحبا ORDELY،\nأريد قالب مخصص:\n- المتجر: ${subdomain || ""}\n- نوع المنتجات: \n- رابط التصميم/صورة: \n`); window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank"); }} className="shrink-0 bg-primary text-white hover:bg-primary/90 px-5 py-2.5 rounded-full text-xs font-black shadow transition-colors">
                تواصل للحصول على قالب مخصص ↗
              </button>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
              <h3 className="font-bold">الألوان</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold">اللون الأساسي</label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={config.primary_color} onChange={e=>setConfig({...config, primary_color: e.target.value})} className="w-12 h-10 rounded-xl border border-border p-1 bg-background" />
                    <input value={config.primary_color} onChange={e=>setConfig({...config, primary_color: e.target.value})} className="flex-1 border border-border rounded-xl px-3 py-2 font-mono text-xs bg-background" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold">لون ثانوي</label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={config.accent_color} onChange={e=>setConfig({...config, accent_color: e.target.value})} className="w-12 h-10 rounded-xl border border-border p-1 bg-background" />
                    <input value={config.accent_color} onChange={e=>setConfig({...config, accent_color: e.target.value})} className="flex-1 border border-border rounded-xl px-3 py-2 font-mono text-xs bg-background" dir="ltr" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {["#E53535","#111111","#0E9F6E","#2563EB","#7C3AED","#EA580C"].map(c=>(
                  <button key={c} onClick={()=>setConfig({...config, primary_color: c})} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
              <h3 className="font-bold">تخصيص الأزرار والخط — كل القوالب</h3>
              <div>
                <label className="text-xs font-bold">لون زر الطلب</label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={config.cta_color || "#2B2A28"} onChange={e=>setConfig({...config, cta_color: e.target.value})} className="w-12 h-10 rounded-xl border border-border p-1 bg-background" />
                  <input value={config.cta_color || "#2B2A28"} onChange={e=>setConfig({...config, cta_color: e.target.value})} className="flex-1 border border-border rounded-xl px-3 py-2 font-mono text-xs bg-background" dir="ltr" />
                </div>
                <div className="flex gap-2 mt-2">
                  {["#2B2A28","#C47A5A","#111111","#0E9F6E","#4F46E5","#E53535"].map(c=>(
                    <button key={c} onClick={()=>setConfig({...config, cta_color: c})} className={`w-8 h-8 rounded-full border-2 shadow-sm ${config.cta_color===c ? "border-primary scale-110" : "border-white"}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold">نوع الخط</label>
                <select value={config.font || "geist"} onChange={e=>setConfig({...config, font: e.target.value as any})} className="w-full mt-1 border border-border rounded-xl px-3 py-2.5 bg-background text-sm">
                  <option value="geist">Geist — عصري متوازن (Tech/Digital)</option>
                  <option value="instrument">Instrument Serif — فاخر (Atelier)</option>
                  <option value="inter">Inter — نظيف</option>
                  <option value="cairo">Cairo — عربي حديث</option>
                  <option value="tajawal">Tajawal — عربي</option>
                  <option value="manrope">Manrope — مستدير</option>
                </select>
                <div className="mt-2 text-xs px-3 py-2 rounded-lg bg-background border border-border" style={{ fontFamily: config.font==="instrument" ? "'Instrument Serif', serif" : config.font==="cairo" ? "'Cairo', sans-serif" : config.font==="tajawal" ? "'Tajawal', sans-serif" : config.font==="manrope" ? "'Manrope', sans-serif" : "'Geist', sans-serif" }}>
                  معاينة: {config.font==="instrument" ? "Atelier Typography" : config.font==="cairo" ? "مرحبا بالخط العربي" : "Geist preview — Aa Bb 123"}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold">شكل الزر</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[
                    { id: "pill", label: "Pill", style: "rounded-full" },
                    { id: "xl", label: "XL", style: "rounded-xl" },
                    { id: "lg", label: "LG", style: "rounded-lg" },
                    { id: "none", label: "حاد", style: "rounded-none" },
                  ].map(b=>(
                    <button key={b.id} onClick={()=>setConfig({...config, button_radius: b.id as any})} className={`py-2.5 text-xs font-bold border-2 ${config.button_radius===b.id ? "bg-primary text-white border-primary" : "bg-background border-border"} ${b.style}`}>{b.label}</button>
                  ))}
                </div>
                <div className="mt-3 flex justify-center">
                  <div className={`px-6 py-2.5 text-xs font-bold text-white ${config.button_radius==="pill" ? "rounded-full" : config.button_radius==="xl" ? "rounded-xl" : config.button_radius==="lg" ? "rounded-lg" : "rounded-none"}`} style={{ background: config.cta_color || "#2B2A28" }}>معاينة الزر</div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">الأقسام — {templates.find(t=>t.id===config.template)?.name.split(" —")[0]}</h3>
                <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded-full">{config.template}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">تحكم بما يظهر في قالبك الحالي — كل مفتاح يخفي/يُظهر سكشن حقيقي في المتجر وصفحة المنتج فوراً.</p>
              <div className="space-y-2.5">
                {(() => {
                  const S = [
                    // مشترك لكل القوالب
                    { k: "show_shipping", label: "شريط الإعلان العلوي", desc: "الشريط المتحرك أعلى المتجر — يظهر الإعلان والشحن", icon: "◈", templates: ["atelier","tech","digital","beauty"] },
                    // خاص بكل قالب
                    ...(config.template==="atelier" ? [
                      { k: "show_features", label: "مميزات الهيرو", desc: "58 Wilayas • الدفع عند الاستلام • 14 يوم — أسفل الهيرو", icon: "✦", templates: ["atelier"] },
                      { k: "show_faq", label: "الأسئلة الشائعة", desc: "Livraison / Retours / Support في صفحة المنتج", icon: "?", templates: ["atelier"] },
                      { k: "show_specs", label: "تفاصيل إضافية", desc: "قسم التفاصيل تحت الوصف", icon: "≡", templates: ["atelier"] },
                    ] : config.template==="tech" ? [
                      { k: "show_specs", label: "المواصفات التقنية", desc: "Batterie • Garantie • Livraison — جدول المواصفات", icon: "⚡", templates: ["tech"] },
                      { k: "show_faq", label: "الأسئلة الشائعة", desc: "Livraison / Retours", icon: "?", templates: ["tech"] },
                    ] : config.template==="digital" ? [
                      { k: "show_specs", label: "المواصفات", desc: "Version • Compatibilité • Support", icon: "◆", templates: ["digital"] },
                      { k: "show_faq", label: "الأسئلة الشائعة", desc: "Comment recevoir / Garantie", icon: "?", templates: ["digital"] },
                    ] : [
                      { k: "show_ingredients", label: "المكونات", desc: "Ingrédients clés — شارات المكونات الطبيعية", icon: "🌿", templates: ["beauty"] },
                      { k: "show_specs", label: "التفاصيل", desc: "Origine • Texture • Pour qui", icon: "≡", templates: ["beauty"] },
                      { k: "show_faq", label: "الأسئلة الشائعة", desc: "Livraison / Peau sensible / Retours", icon: "?", templates: ["beauty"] },
                    ]),
                  ] as const;
                  return S.filter(s=> s.templates.includes(config.template as any)).map(s=>{
                    const checked = (config as any)[s.k] !== false;
                    return (
                      <label key={s.k} className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${checked ? "bg-primary/5 border-primary/20" : "bg-background border-border opacity-70"}`}>
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${checked ? "bg-primary text-white" : "bg-muted text-muted"}`}>{s.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black leading-tight">{s.label}</div>
                          <div className="text-xs text-muted leading-relaxed mt-0.5">{s.desc}</div>
                        </div>
                        <span className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
                          <input type="checkbox" checked={checked} onChange={e=>setConfig({...config, [s.k]: e.target.checked})} className="sr-only" />
                        </span>
                      </label>
                    );
                  });
                })()}
              </div>
              <div className="flex gap-2 text-[11px]">
                <button onClick={()=>setConfig({...config, show_shipping:true, show_features:true, show_faq:true, show_specs:true, show_ingredients:true })} className="flex-1 py-2 rounded-full border border-border bg-background font-bold hover:bg-muted">تفعيل الكل</button>
                <button onClick={()=>setConfig({...config, show_shipping:false, show_features:false, show_faq:false, show_specs:false, show_ingredients:false })} className="flex-1 py-2 rounded-full border border-border bg-background font-bold hover:bg-muted">إخفاء الكل</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
              <h3 className="font-bold">الشعار والبانر</h3>
              <div>
                <label className="text-xs font-bold">اسم المتجر</label>
                <input value={form.business_name} onChange={e=>setForm({...form, business_name: e.target.value})} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold">الوصف</label>
                <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={2} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="متجر جزائري..." />
              </div>
              <div>
                <label className="text-xs font-bold">شعار</label>
                <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadFile(f,"logo").then(url=>url&&setForm({...form, logo_url: url}))}} className="w-full mt-1 border border-border rounded-xl px-3 py-2 bg-background text-sm file:bg-primary file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-bold" />
                {form.logo_url && <img src={form.logo_url} className="w-16 h-16 rounded-xl object-cover border border-border mt-2" alt="logo" />}
              </div>
              <div>
                <label className="text-xs font-bold">بانر علوي (اختياري)</label>
                <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadFile(f,"banner").then(url=>url&&setForm({...form, banner_url: url}))}} className="w-full mt-1 border border-border rounded-xl px-3 py-2 bg-background text-sm file:bg-primary file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-bold" />
                {form.banner_url && <img src={form.banner_url} className="w-full h-24 object-cover rounded-xl border border-border mt-2" alt="banner" />}
              </div>
            </div>

            <button onClick={save} disabled={saving} className="w-full bg-primary text-white rounded-xl py-4 font-black hover:opacity-90 disabled:opacity-40 transition-opacity shadow-sm">
              {saving ? "جاري الحفظ..." : "حفظ كل التخصيصات "}
            </button>
            {msg && <div className="text-center text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
          </div>
        </div>
      )}

      {tab==="content" && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm max-w-2xl">
          <h3 className="font-bold">محتوى الهبوط</h3>
          <div>
            <label className="text-xs font-bold">شريط الإعلان العلوي</label>
            <input value={config.announcement} onChange={e=>setConfig({...config, announcement: e.target.value})} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="توصيل مجاني..." />
          </div>
          <div>
            <label className="text-xs font-bold">عنوان الهيرو (اختياري — يظهر بدل اسم المنتج إن كتبته)</label>
            <input value={config.hero_title} onChange={e=>setConfig({...config, hero_title: e.target.value})} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="مثال: ساعة فاخرة تليق بك" />
          </div>
          <div>
            <label className="text-xs font-bold">وصف الهيرو</label>
            <textarea value={config.hero_subtitle} onChange={e=>setConfig({...config, hero_subtitle: e.target.value})} rows={2} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="جودة عالية..." />
          </div>
          {(config.template === "atelier" || config.template === "tech" || config.template === "digital") && (
            <>
              <div>
                <label className="text-xs font-bold">نص الشارة (Badge)</label>
                <input value={config.badge_text || ""} onChange={e=>setConfig({...config, badge_text: e.target.value})} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="الأكثر طلباً" />
              </div>
              <div>
                <label className="text-xs font-bold">نص زر الطلب</label>
                <input value={config.cta_text || ""} onChange={e=>setConfig({...config, cta_text: e.target.value})} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="اطلب الآن" />
              </div>
            </>
          )}
          {config.template === "digital" && (
            <>
              <div>
                <label className="text-xs font-bold">رابط التنزيل</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="checkbox" checked={config.show_download_link !== false} onChange={e=>setConfig({...config, show_download_link: e.target.checked})} className="w-5 h-5 accent-ink" />
                  <span className="text-sm">{config.download_text || "تنزيل"}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold">نص الرخصة</label>
                <textarea value={config.license_text || ""} onChange={e=>setConfig({...config, license_text: e.target.value})} rows={1} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="رخصة الاستخدام للمنتج..." />
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-bold">نص الفوتر</label>
            <input value={config.footer_text} onChange={e=>setConfig({...config, footer_text: e.target.value})} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="© متجري — جميع الحقوق" />
          </div>
          <button onClick={save} disabled={saving} className="w-full bg-primary text-white rounded-xl py-3.5 font-bold hover:opacity-90 disabled:opacity-40">{saving ? "جاري..." : "حفظ المحتوى"}</button>
          {msg && <div className="text-center text-sm font-bold text-emerald-600">{msg}</div>}
        </div>
      )}

      {tab==="preview" && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-bold mb-4">معاينة حية — القالب: {config.template}</h3>
          <div className="rounded-xl border border-border overflow-hidden">
            {config.template==="atelier" && (
              <div className="bg-[#FAF9F6] p-6 text-[#111]">
                <div className="font-serif text-xl">{config.font==="instrument" ? "Atelier" : ""} / ALG</div>
                <div className="text-xs tracking-[0.18em] uppercase opacity-60 mt-1">LIVRAISON 58 WILAYAS — فاشن</div>
                <h2 className="font-serif text-2xl mt-3" style={{ fontFamily: config.font==="instrument" ? "'Instrument Serif', serif" : undefined }}>{config.hero_title || "EDIT.04"}</h2>
                <p className="text-sm opacity-70 mt-1">مناسب للأزياء والملابس — serif + marquee</p>
                <div className={`mt-3 text-white text-center py-2 text-xs tracking-[0.14em] uppercase ${config.button_radius==="pill" ? "rounded-full" : config.button_radius==="xl" ? "rounded-xl" : config.button_radius==="lg" ? "rounded-lg" : "rounded-none"}`} style={{ background: config.cta_color || "#111" }}>Commander</div>
              </div>
            )}
            {config.template==="tech" && (
              <div className="bg-[#0B0B0C] p-6 text-[#EDEDED]">
                <div className="font-mono text-xs tracking-[0.18em] uppercase opacity-40">Tech</div>
                <h2 className="text-2xl font-bold mt-3 tracking-tight">{config.hero_title || "NOVA PRO"}</h2>
                <p className="text-sm opacity-60 mt-1">مثالي للإلكترونيات والهواتف — داكن تقني</p>
                <div className={`mt-3 text-center py-2 text-xs font-mono uppercase ${config.button_radius==="pill" ? "rounded-full" : config.button_radius==="xl" ? "rounded-xl" : config.button_radius==="lg" ? "rounded-lg" : "rounded-none"}`} style={{ background: config.cta_color || "#EDEDED", color: config.cta_color ? "#fff" : "#0B0B0C" }}>Commander — Tech</div>
              </div>
            )}
            {config.template==="digital" && (
              <div className="bg-[#F6F7FF] p-6 text-[#111] border border-[#E8EAF6] overflow-hidden">
                <div className="font-mono text-xs tracking-[0.18em] uppercase opacity-60">Digital</div>
                <h2 className="text-xl font-bold mt-3 tracking-tight">Digital</h2>
                <p className="text-sm opacity-60 mt-1">برمجيات وحلول رقمية — تراخيص أصلية</p>
                <div className={`mt-4 text-white text-center py-3 text-xs font-mono uppercase ${config.button_radius==="pill" ? "rounded-full" : config.button_radius==="xl" ? "rounded-xl" : config.button_radius==="lg" ? "rounded-lg" : "rounded-none"}`} style={{ background: config.cta_color || "#111" }}>تنزيل — licence key</div>
              </div>
            )}
            {config.template==="beauty" && (
              <div className="bg-[#F8F5F0] p-6 text-[#2B2A28] border border-[#E8E0D5] overflow-hidden">
                <div className="serif text-lg" style={{ fontFamily: "'Fraunces', serif" }}>Maison <em style={{ color: "#C47A5A" }}>Terre</em></div>
                <div className="text-xs tracking-[0.18em] uppercase opacity-60 mt-1">Naturel — Fabriqué en Algérie</div>
                <h2 className="serif text-2xl mt-3" style={{ fontFamily: "'Fraunces', serif" }}>Des soins qui sentent la terre</h2>
                <p className="text-sm opacity-70 mt-1">مستوحى من Consumable-Beauty-General.html — كما هو تماماً</p>
                <div className="mt-3 bg-[#2B2A28] text-white text-center py-2.5 text-xs rounded-full">Découvrir</div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-soft mt-3">المعاينة تقريبية — افتح متجرك الحقيقي لترى التطبيق الكامل على منتج فعلي. كل القوالب ترتبط صحيحاً: المتجر الرئيسي <code className="bg-background border px-1 rounded">/{subdomain}</code> وصفحة المنتج <code className="bg-background border px-1 rounded">/{subdomain}/p/{"{slug}"}</code>.</p>
        </div>
      )}
    </div>
  );
}
