"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconPackage, IconLink } from "@/components/icons";

const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN || "coddz.com";

type Product = { id: string; name: string; slug: string; price: number; description: string | null; image_url: string | null; category: string | null; is_active: boolean; compare_at_price: number | null };

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", price: "", description: "", image_url: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
    if (!mem) return;
    setMerchantId(mem.merchant_id);
    const { data: merch } = await supabase.from("merchants").select("subdomain").eq("id", mem.merchant_id).single();
    if (merch) setSubdomain(merch.subdomain);
    const { data } = await supabase.from("products").select("*").eq("merchant_id", mem.merchant_id).order("created_at", { ascending: false }).limit(50);
    if (data) setProducts(data as Product[]);
  }
  useEffect(() => { load(); }, []);

  async function compressAndUpload(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const img = await createImageBitmap(file);
      const max = 1024;
      let { width, height } = img;
      if (width > max || height > max) {
        const ratio = Math.min(max / width, max / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.8));
      if (!blob) throw new Error("فشل الضغط");
      const path = `${merchantId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}.jpg`;
      const { error } = await supabase.storage.from("product-images").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      setImagePreview(data.publicUrl);
      return data.publicUrl;
    } catch (e) {
      alert(e instanceof Error ? e.message : "فشل الرفع");
      return null;
    } finally { setUploading(false); }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!merchantId) return;
    setLoading(true);
    const slug = form.slug.toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("products").insert({
      merchant_id: merchantId,
      name: form.name,
      slug,
      price: Number(form.price),
      description: form.description,
      image_url: form.image_url || null,
      category: form.category || null,
      is_active: true,
    });
    if (!error) { setForm({ name: "", slug: "", price: "", description: "", image_url: "", category: "" }); setImagePreview(null); load(); } else alert(error.message);
    setLoading(false);
  }

  async function toggleActive(p: Product) {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">المنتجات</h1>
          <p className="text-sm font-medium text-muted-soft mt-1">أدر منتجاتك وشاركها برابط احترافي — مجاني</p>
        </div>
        {subdomain && (
          <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border">
            <IconLink className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs font-bold text-muted-soft">رابط متجرك (شاركه)</div>
              <div className="font-mono text-sm font-bold text-foreground" dir="ltr">{BASE}/{subdomain}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`https://${BASE}/${subdomain}`); alert("تم نسخ رابط المتجر"); }} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark">نسخ</button>
          </div>
        )}
      </div>
      <form onSubmit={create} className="bg-card rounded-2xl border border-border p-5 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">اسم المنتج</label>
          <input required placeholder="مثال: ساعة فاخرة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">slug (رابط)</label>
          <input required placeholder="montre-luxe" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="w-full border border-border rounded-xl px-4 py-3 text-left bg-card focus:border-primary outline-none" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">السعر (دج)</label>
          <input required placeholder="2500" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-card focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">صورة المنتج (رفع مجاني)</label>
          <div className="flex gap-2">
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImagePreview(URL.createObjectURL(f)); compressAndUpload(f); }}} className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-card file:mr-2 file:bg-card file:text-foreground file:border-0 file:rounded-lg file:px-3 file:py-1" />
            {uploading && <span className="text-xs font-bold text-muted-soft py-2">جاري الضغط...</span>}
          </div>
          {imagePreview && <a href={imagePreview} target="_blank" className="text-sm text-primary font-bold underline">✓ مرفوعة — معاينة</a>}
          <input placeholder="أو رابط خارجي (اختياري)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-card/5" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-bold text-muted-soft mb-1">الفئة (اختياري)</label>
          <input list="cats" placeholder="مثال: إلكترونيات، ملابس" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-card focus:border-primary outline-none" />
          <datalist id="cats"><option value="إلكترونيات"/><option value="ملابس"/><option value="منزل"/><option value="جمال"/><option value="أطفال"/></datalist>
        </div>
        <textarea placeholder="الوصف (اختياري)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-border rounded-xl px-4 py-3 bg-card focus:border-primary outline-none md:col-span-2" rows={2} />
        <button disabled={loading || uploading} className="bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark disabled:opacity-50 md:col-span-2 shadow-sm">{loading ? "جاري..." : "إضافة منتج — مجاني"}</button>
      </form>
      <div className="grid md:grid-cols-2 gap-5">
        {products.map((p) => (
          <div key={p.id} className="bg-card rounded-2xl border border-border p-5 flex gap-5 hover:border-border transition">
            {p.image_url ? <img src={p.image_url} alt={p.name} className="w-24 h-24 rounded-xl object-cover border border-border" /> : <div className="w-24 h-24 rounded-xl bg-card/5 border border-border flex items-center justify-center"><IconPackage className="w-8 h-8 text-primary" /></div>}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-foreground truncate">{p.name} {p.category && <span className="text-xs bg-card/2 border border-card/2 px-2 py-0.5 rounded-full font-bold">#{p.category}</span>}</div>
              <div className="text-sm text-muted-soft font-mono truncate" dir="ltr">{BASE}/{subdomain}/p/{p.slug}</div>
              <div className="text-foreground font-black mt-1">{p.price} دج</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button onClick={() => toggleActive(p)} className={`text-xs px-3 py-1 rounded-full font-bold border ${p.is_active ? "bg-primary/10 text-primary" : "bg-card/2 text-muted-soft border-card/2"} ${p.is_active ? "" : "opacity-50"} `}>{p.is_active ? "✓ نشط" : "مخفي"}</button>
                <button onClick={() => { const url = `https://${BASE}/${subdomain}/p/${p.slug}`; navigator.clipboard.writeText(url); alert("تم نسخ: " + url); }} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold hover:bg-primary/20">نسخ الرابط المجاني</button>
                <button onClick={async () => { if (confirm("حذف المنتج؟")) { await supabase.from("products").delete().eq("id", p.id); load(); } }} className="text-xs bg-card border border-border rounded-full font-bold hover:bg-border">حذف</button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="text-center text-muted-soft font-medium p-8 md:col-span-2 bg-card rounded-2xl border border-border">لا منتجات بعد — أضف أول منتج أعلاه</div>}
      </div>
    </div>
  );
}