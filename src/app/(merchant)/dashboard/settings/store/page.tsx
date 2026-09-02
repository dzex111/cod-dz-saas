"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Template = "minimal" | "bold" | "warm";

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
  footer_text: string;
};

const DEFAULT: Config = {
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
    setMsg("✓ تم حفظ كل التخصيصات — متجرك تحدث فوراً");
    setSaving(false);
    setTimeout(()=>setMsg(""), 4000);
  }

  const templates: { id: Template; name: string; desc: string }[] = [
    { id: "minimal", name: "Minimal", desc: "نظيف، أبيض، مساحات واسعة — مثل Apple" },
    { id: "bold", name: "Bold", desc: "داكن، قوي، هيرو كبير — مثل Nike" },
    { id: "warm", name: "Warm", desc: "دافئ، ترابي، ودود — مثل متاجر طبيعية" },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight">تخصيص المتجر — مثل شوبيفاي</h1>
          <p className="text-sm text-muted mt-1">اختر قالباً، غيّر الألوان، وتحكم في كل سكشن. التغيير يظهر فوراً في متجرك.</p>
        </div>
        {subdomain && <a href={`https://${process.env.NEXT_PUBLIC_BASE_DOMAIN}/${subdomain}`} target="_blank" className="hidden sm:inline-flex px-4 py-2 rounded-full bg-ink text-white text-xs font-bold hover:opacity-90">معاينة المتجر ↗</a>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-border p-1.5 rounded-2xl w-fit">
        {[
          { id: "design", label: "التصميم" },
          { id: "content", label: "المحتوى" },
          { id: "preview", label: "معاينة حية" },
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id as never)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${tab===t.id ? "bg-ink text-white shadow-sm" : "text-muted hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="design" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card rounded-[20px] border border-border p-6 space-y-4 shadow-sm">
              <h3 className="font-bold">اختر القالب</h3>
              <div className="grid gap-3">
                {templates.map(t=>(
                  <button key={t.id} onClick={()=>setConfig({...config, template: t.id})} className={`text-right p-4 rounded-2xl border-2 text-sm transition-all ${config.template===t.id ? "border-ink bg-ink text-white" : "border-border bg-background hover:border-border-strong"}`}>
                    <div className="font-black">{t.name} {config.template===t.id && "✓"}</div>
                    <div className={`text-xs mt-1 ${config.template===t.id ? "text-white/70" : "text-muted"}`}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-[20px] border border-border p-6 space-y-4 shadow-sm">
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

            <div className="bg-card rounded-[20px] border border-border p-6 space-y-3 shadow-sm">
              <h3 className="font-bold">الأقسام</h3>
              {[
                { k: "show_features", label: "مميزات المنتج (3 نقاط)" },
                { k: "show_reviews", label: "تقييمات الزبائن" },
                { k: "show_shipping", label: "شريط الشحن والتوصيل" },
              ].map(s=>(
                <label key={s.k} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border cursor-pointer">
                  <span className="text-sm font-bold">{s.label}</span>
                  <input type="checkbox" checked={(config as never)[s.k]} onChange={e=>setConfig({...config, [s.k]: e.target.checked})} className="w-5 h-5 accent-ink" />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-[20px] border border-border p-6 space-y-4 shadow-sm">
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
                <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadFile(f,"logo").then(url=>url&&setForm({...form, logo_url: url}))}} className="w-full mt-1 border border-border rounded-xl px-3 py-2 bg-background text-sm file:bg-ink file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-bold" />
                {form.logo_url && <img src={form.logo_url} className="w-16 h-16 rounded-xl object-cover border border-border mt-2" alt="logo" />}
              </div>
              <div>
                <label className="text-xs font-bold">بانر علوي (اختياري)</label>
                <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadFile(f,"banner").then(url=>url&&setForm({...form, banner_url: url}))}} className="w-full mt-1 border border-border rounded-xl px-3 py-2 bg-background text-sm file:bg-ink file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-bold" />
                {form.banner_url && <img src={form.banner_url} className="w-full h-24 object-cover rounded-xl border border-border mt-2" alt="banner" />}
              </div>
            </div>

            <button onClick={save} disabled={saving} className="w-full bg-ink text-white rounded-2xl py-4 font-black hover:opacity-90 disabled:opacity-40 transition-opacity shadow-lg">
              {saving ? "جاري الحفظ..." : "حفظ كل التخصيصات ✓"}
            </button>
            {msg && <div className="text-center text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
          </div>
        </div>
      )}

      {tab==="content" && (
        <div className="bg-card rounded-[20px] border border-border p-6 space-y-4 shadow-sm max-w-2xl">
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
          <div>
            <label className="text-xs font-bold">نص الفوتر</label>
            <input value={config.footer_text} onChange={e=>setConfig({...config, footer_text: e.target.value})} className="w-full mt-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm" placeholder="© متجري — جميع الحقوق" />
          </div>
          <button onClick={save} disabled={saving} className="w-full bg-ink text-white rounded-xl py-3.5 font-bold hover:opacity-90 disabled:opacity-40">{saving ? "جاري..." : "حفظ المحتوى"}</button>
          {msg && <div className="text-center text-sm font-bold text-emerald-600">{msg}</div>}
        </div>
      )}

      {tab==="preview" && (
        <div className="bg-card rounded-[20px] border border-border p-6 shadow-sm">
          <h3 className="font-bold mb-4">معاينة حية — القالب: {config.template}</h3>
          <div className="rounded-2xl border border-border overflow-hidden">
            {config.template==="minimal" && (
              <div className="bg-white p-8 text-center">
                <div className="text-xs tracking-widest font-bold text-muted-soft uppercase">{config.announcement}</div>
                <h2 className="text-3xl font-black mt-2" style={{ color: config.primary_color }}>{config.hero_title || form.business_name || "منتجك هنا"}</h2>
                <p className="text-muted mt-2">{config.hero_subtitle || form.description || "وصف المنتج سيظهر هنا"}</p>
                <div className="mt-4 inline-flex px-6 py-3 rounded-full text-white font-bold" style={{ background: config.primary_color }}>اطلب الآن</div>
              </div>
            )}
            {config.template==="bold" && (
              <div className="bg-zinc-900 text-white p-8">
                <div className="text-xs bg-white/10 inline-block px-3 py-1 rounded-full">{config.announcement}</div>
                <h2 className="text-4xl font-black mt-3" style={{ color: config.primary_color }}>{config.hero_title || form.business_name}</h2>
                <p className="text-white/70 mt-2">{config.hero_subtitle || "تصميم جريء وقوي"}</p>
              </div>
            )}
            {config.template==="warm" && (
              <div className="bg-[#FDF6EE] p-8 text-center border-t-4" style={{ borderColor: config.primary_color }}>
                <h2 className="text-3xl font-black text-zinc-900">{config.hero_title || form.business_name}</h2>
                <p className="text-zinc-600 mt-2">{config.hero_subtitle || "دافئ وودود مثل بيتك"}</p>
                <div className="mt-3 text-xs bg-white border px-3 py-1 rounded-full inline-block">{config.announcement}</div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-soft mt-3">المعاينة تقريبية — افتح متجرك الحقيقي لترى التطبيق الكامل على منتج فعلي.</p>
        </div>
      )}
    </div>
  );
}
