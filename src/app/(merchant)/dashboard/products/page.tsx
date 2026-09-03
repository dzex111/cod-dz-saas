"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconPackage, IconLink } from "@/components/icons";

const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN || "cod-dz-saas.vercel.app";

type Product = { id: string; name: string; slug: string; price: number; description: string | null; image_url: string | null; category: string | null; is_active: boolean; compare_at_price: number | null };

function parseImages(image_url: string | null): string[] {
  if (!image_url) return [];
  try {
    const parsed = JSON.parse(image_url);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return [image_url];
}

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", price: "", description: "", category: "" });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [externalUrl, setExternalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string>("");

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
    try {
      const img = await createImageBitmap(file);
      const max = 1280;
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
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.82));
      if (!blob) throw new Error("فشل الضغط");
      const path = `${merchantId}/${Date.now()}-${Math.random().toString(36).slice(2,6)}-${file.name.replace(/\s+/g, "-")}.jpg`;
      const { error } = await supabase.storage.from("product-images").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (e) {
      alert(e instanceof Error ? e.message : "فشل الرفع");
      return null;
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !merchantId) return;
    const arr = Array.from(files).slice(0, 6 - imageUrls.length);
    if (imageUrls.length + arr.length > 6) { alert("الحد 6 صور"); return; }
    setUploading(arr.length);
    for (const f of arr) {
      const url = await compressAndUpload(f);
      if (url) setImageUrls(prev => [...prev, url]);
      setUploading(u => Math.max(0, u - 1));
    }
  }

  function addExternal() {
    const url = externalUrl.trim();
    if (!url) return;
    try { new URL(url); } catch { alert("رابط غير صالح"); return; }
    if (imageUrls.length >= 6) { alert("الحد 6 صور"); return; }
    setImageUrls(prev => [...prev, url]);
    setExternalUrl("");
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const n = [...imageUrls];
    const j = idx + dir;
    if (j < 0 || j >= n.length) return;
    [n[idx], n[j]] = [n[j], n[idx]];
    setImageUrls(n);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!merchantId) return;
    if (imageUrls.length === 0) { if (!confirm("بدون صور؟")) return; }
    setLoading(true);
    const slug = form.slug.toLowerCase().replace(/\s+/g, "-");
    // store as JSON array if multiple, else single string for backward compat — but always handle as JSON in front
    const image_url = imageUrls.length === 0 ? null : imageUrls.length === 1 ? imageUrls[0] : JSON.stringify(imageUrls);
    const { error } = await supabase.from("products").insert({
      merchant_id: merchantId,
      name: form.name,
      slug,
      price: Number(form.price),
      description: form.description,
      image_url: image_url as any,
      category: form.category || null,
      is_active: true,
    });
    if (!error) { setForm({ name: "", slug: "", price: "", description: "", category: "" }); setImageUrls([]); setExternalUrl(""); load(); } else alert(error.message);
    setLoading(false);
  }

  async function toggleActive(p: Product) {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">المنتجات — صور احترافية</h1>
          <p className="text-sm text-muted mt-1">حتى 6 صور لكل منتج • الأولى غلاف • اسحب لإعادة الترتيب • ضغط تلقائي 1280px</p>
        </div>
        {subdomain && (
          <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border shadow-sm">
            <IconLink className="w-5 h-5 text-primary" />
            <div>
              <div className="text-[11px] font-bold tracking-widest text-muted-soft uppercase">رابط متجرك</div>
              <div className="font-mono text-sm font-bold text-foreground" dir="ltr">{BASE}/{subdomain}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`https://${BASE}/${subdomain}`); alert("تم نسخ رابط المتجر"); }} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors">نسخ</button>
          </div>
        )}
      </div>

      <form onSubmit={create} className="bg-card rounded-xl border border-border p-6 grid md:grid-cols-2 gap-4 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">اسم المنتج</label>
          <input required placeholder="مثال: ساعة فاخرة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">slug (رابط)</label>
          <input required placeholder="montre-luxe" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="w-full border border-border rounded-xl px-4 py-3 text-left bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm placeholder:text-muted-soft" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">السعر (دج)</label>
          <input required placeholder="2500" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">الفئة (اختياري)</label>
          <input list="cats" placeholder="مثال: إلكترونيات، ملابس" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm" />
          <datalist id="cats"><option value="إلكترونيات"/><option value="ملابس"/><option value="منزل"/><option value="جمال"/><option value="أطفال"/></datalist>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1.5">صور المنتج — حتى 6 صور (الأولى غلاف)</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {imageUrls.map((url, i) => (
              <div key={url+i} className="group relative aspect-square rounded-xl overflow-hidden border-2 bg-background shadow-sm" style={{ borderColor: i===0 ? "#111" : "#E8E6E1" }}>
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i===0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">غلاف</span>}
                <button type="button" onClick={()=>setImageUrls(prev=>prev.filter((_,idx)=>idx!==i))} className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                <div className="absolute inset-x-1 bottom-1 flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition">
                  <button type="button" disabled={i===0} onClick={()=>moveImage(i,-1)} className="bg-white/90 border border-border rounded-full w-6 h-6 flex items-center justify-center text-xs disabled:opacity-30">‹</button>
                  <button type="button" disabled={i===imageUrls.length-1} onClick={()=>moveImage(i,1)} className="bg-white/90 border border-border rounded-full w-6 h-6 flex items-center justify-center text-xs disabled:opacity-30">›</button>
                </div>
              </div>
            ))}
            {imageUrls.length < 6 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-border bg-background hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition">
                <input type="file" accept="image/*" multiple onChange={(e)=>handleFiles(e.target.files)} className="hidden" />
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-lg">+</span>
                <span className="text-xs font-bold mt-1">إضافة صور</span>
                <span className="text-[10px] text-muted">{imageUrls.length}/6</span>
              </label>
            )}
          </div>
          {uploading>0 && <div className="text-xs font-bold text-primary mt-2">جاري رفع {uploading} صور — ضغط تلقائي...</div>}
          <div className="flex gap-2 mt-3">
            <input placeholder="أو أضف رابط صورة خارجي" value={externalUrl} onChange={(e)=>setExternalUrl(e.target.value)} className="flex-1 border border-border rounded-xl px-3 py-2 text-xs bg-background placeholder:text-muted-soft" dir="ltr" />
            <button type="button" onClick={addExternal} className="px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold hover:bg-card-hover">إضافة رابط</button>
          </div>
          <p className="text-[11px] text-muted mt-1.5">الصور تُضغط تلقائياً 1280px JPEG 82% • اسحب لتغيير الترتيب • الأولى تظهر في المتجر كغلاف</p>
        </div>

        <textarea placeholder="الوصف (اختياري)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-border rounded-xl px-4 py-3 bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition md:col-span-2 text-sm placeholder:text-muted-soft" rows={2} />
        <button disabled={loading || !!uploading} className="bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-hover disabled:opacity-50 md:col-span-2 shadow-sm transition-colors">{loading ? "جاري..." : "إضافة منتج — مجاني"}</button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {products.map((p) => {
          const imgs = parseImages(p.image_url);
          const cover = imgs[0];
          return (
          <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-md hover:border-border-strong transition-all">
            {cover ? <img src={cover} alt={p.name} className="w-24 h-24 rounded-xl object-cover border border-border shrink-0" /> : <div className="w-24 h-24 rounded-xl bg-card-hover border border-border flex items-center justify-center shrink-0"><IconPackage className="w-8 h-8 text-muted-soft" /></div>}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground truncate text-sm">{p.name} {p.category && <span className="text-xs bg-background border border-border px-2 py-0.5 rounded-full font-bold text-muted">#{p.category}</span>} <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-1">{parseImages(p.image_url).length} صور</span></div>
              <div className="text-xs text-muted-soft font-mono truncate mt-0.5" dir="ltr">{BASE}/{subdomain}/p/{p.slug}</div>
              <div className="text-foreground font-black mt-1 text-sm">{p.price.toLocaleString("fr-DZ")} دج</div>
              {imgs.length>1 && <div className="flex gap-1 mt-1.5">{imgs.slice(0,4).map((u,i)=><img key={i} src={u} alt="" className="w-8 h-8 rounded-lg object-cover border border-border" />)}{imgs.length>4 && <span className="text-xs bg-muted px-1.5 py-1 rounded-full">+{imgs.length-4}</span>}</div>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button onClick={() => toggleActive(p)} className={`text-xs px-3 py-1 rounded-full font-bold border ${p.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-50 text-muted border-border"}`}>{p.is_active ? " نشط" : "مخفي"}</button>
                <button onClick={() => { const url = `https://${BASE}/${subdomain}/p/${p.slug}`; navigator.clipboard.writeText(url); alert("تم نسخ: " + url); }} className="text-xs bg-background border border-border px-3 py-1.5 rounded-full font-bold hover:bg-card-hover">نسخ الرابط</button>
                <button onClick={async () => { if (confirm("حذف المنتج؟")) { await supabase.from("products").delete().eq("id", p.id); load(); } }} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full font-bold">حذف</button>
              </div>
            </div>
          </div>
        )})}
        {products.length === 0 && <div className="text-center text-muted text-sm p-10 md:col-span-2 bg-card rounded-xl border border-dashed border-border">لا منتجات بعد — أضف أول منتج أعلاه</div>}
      </div>
    </div>
  );
}
