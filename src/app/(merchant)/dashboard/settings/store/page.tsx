"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StoreSettingsPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ business_name: "", description: "", primary_color: "#e82222", logo_url: "", banner_url: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [merchantId, setMerchantId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user!.id).single();
      if (!mem) return;
      setMerchantId(mem.merchant_id);
      const { data: m } = await supabase.from("merchants").select("business_name, description, primary_color, logo_url, banner_url").eq("id", mem.merchant_id).single();
      if (m) setForm({ business_name: m.business_name || "", description: m.description || "", primary_color: m.primary_color || "#e82222", logo_url: m.logo_url || "", banner_url: m.banner_url || "" });
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!merchantId) return;
    setSaving(true);
    const { error } = await supabase.from("merchants").update({
      business_name: form.business_name,
      description: form.description,
      primary_color: form.primary_color,
      logo_url: form.logo_url || null,
      banner_url: form.banner_url || null,
    }).eq("id", merchantId);
    setSaving(false);
    if (error) setMsg(error.message);
    else setMsg("✓ تم حفظ تخصيص المتجر");
  }

  return (
    <div className="max-w-2xl space-y-6 bg-background">
      <h1 className="text-xl font-extrabold text-foreground">تخصيص المتجر — مجاني</h1>
      <p className="text-sm font-medium text-muted-soft">شعار، وصف، ولون أساسي يظهر في واجهة زبائنك.</p>
      <form onSubmit={save} className="bg-card rounded-2xl border border-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">اسم المتجر</label>
          <input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">وصف المتجر (يظهر في الواجهة)</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="متجر جزائري للدفع عند الاستلام..." className="w-full border border-border rounded-xl px-4 py-3 bg-card focus:border-primary outline-none" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-muted-soft mb-1">اللون الأساسي</label>
            <div className="flex gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-11 rounded-xl border border-card p-1 bg-white" />
              <input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="flex-1 border border-border rounded-xl px-4 py-3 font-mono text-left" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-soft mb-1">شعار المتجر</label>
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { uploadFile(f, "logo").then(url => { if (url) setForm({ ...form, logo_url: url }); }); }}} className="w-full border border-border rounded-xl px-3 py-2 bg-card file:bg-card file:text-foreground file:border-0 file:rounded-lg file:px-3 file:py-1" />
            {form.logo_url && <img src={form.logo_url} alt="logo" className="w-16 h-16 rounded-xl object-cover border mt-2" />}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">رابط الشعار (أو ارفع أعلاه)</label>
          <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." className="w-full border border-border rounded-xl px-4 py-2 bg-card/5 text-left" dir="ltr" />
        </div>
        <button disabled={saving} className="w-full bg-card border border-primary rounded-xl py-3.5 font-bold text-primary hover:bg-primary/5 disabled:opacity-40 shadow-sm">{saving ? "جاري الحفظ..." : "حفظ التخصيص"}</button>
        {msg && <div className="text-center text-sm font-bold text-primary">{msg}</div>}
      </form>
    </div>
  );
}