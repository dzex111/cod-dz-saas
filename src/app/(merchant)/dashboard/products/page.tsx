"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconPackage, IconLink } from "@/components/icons";

type Product = { id: string; name: string; slug: string; price: number; stock_quantity: number; is_active: boolean; image_url: string | null; category: string | null };

const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN || "coddz.com";

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", price: "", description: "", image_url: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    setUploading(true);
    try {
      // ضغط مجاني عبر canvas (max 1024, quality 0.8)
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
    if (!error) { setForm({ name: "", slug: "", price: "", description: "", image_url: "", category: "" }); load(); } else alert(error.message);
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
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">المنتجات</h1>
          <p className="text-sm font-medium text-zinc-600 mt-1">أدر منتجاتك وشاركها برابط احترافي — مجاني</p>
        </div>
        {subdomain && (
          <div className="bg-white border-2 border-zinc-200 rounded-2xl px-5 py-3 flex items-center gap-3">
            <IconLink className="w-5 h-5 text-zinc-700" />
            <div>
              <div className="text-xs font-bold text-zinc-600">رابط متجرك (شاركه)</div>
              <div className="font-mono text-sm font-bold text-zinc-900" dir="ltr">{BASE}/{subdomain}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`https://${BASE}/${subdomain}`); alert("تم نسخ رابط المتجر"); }} className="ml-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black">نسخ</button>
          </div>
        )}
      </div>
      <form onSubmit={create} className="bg-white rounded-2xl border-2 border-zinc-200 p-5 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1">اسم المنتج</label>
          <input required placeholder="مثال: ساعة فاخرة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 bg-white text-zinc-900 focus:border-zinc-900 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1">slug (رابط)</label>
          <input required placeholder="montre-luxe" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 text-left bg-white focus:border-zinc-900 outline-none" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1">السعر (دج)</label>
          <input required placeholder="2500" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 bg-white focus:border-zinc-900 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1">صورة المنتج (رفع مجاني)</label>
          <div className="flex gap-2">
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) compressAndUpload(f); }} className="flex-1 border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm bg-white file:mr-2 file:bg-zinc-900 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1" />
            {uploading && <span className="text-xs font-bold text-zinc-600 py-2">جاري الضغط...</span>}
          </div>
          {form.image_url && <a href={form.image_url} target="_blank" className="text-xs text-emerald-700 font-bold underline">✓ مرفوعة — معاينة</a>}
          <input placeholder="أو رابط خارجي (اختياري)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs mt-2 text-left bg-zinc-50" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1">الفئة (اختياري)</label>
          <input list="cats" placeholder="مثال: إلكترونيات، ملابس" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border-2 border-zinc-300 rounded-xl px-4 py-3 bg-white focus:border-zinc-900 outline-none" />
          <datalist id="cats"><option value="إلكترونيات"/><option value="ملابس"/><option value="منزل"/><option value="جمال"/><option value="أطفال"/></datalist>
        </div>
        <textarea placeholder="الوصف (اختياري)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-2 border-zinc-300 rounded-xl px-4 py-3 md:col-span-2 bg-white focus:border-zinc-900 outline-none" rows={2} />
        <button disabled={loading || uploading} className="bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-black disabled:opacity-50 md:col-span-2 shadow-sm">{loading ? "جاري..." : "إضافة منتج — مجاني"}</button>
      </form>
      <div className="grid md:grid-cols-2 gap-5">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border-2 border-zinc-200 p-5 flex gap-5 hover:border-zinc-300 hover:shadow-sm transition">
            {p.image_url ? <img src={p.image_url} alt={p.name} className="w-24 h-24 rounded-2xl object-cover border border-zinc-200" /> : <div className="w-24 h-24 rounded-2xl bg-zinc-50 border-2 border-zinc-200 flex items-center justify-center"><IconPackage className="w-8 h-8 text-zinc-400" /></div>}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-zinc-900 truncate">{p.name} {p.category && <span className="text-xs bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full font-bold">#{p.category}</span>}</div>
              <div className="text-xs text-zinc-600 font-mono truncate" dir="ltr">{BASE}/{subdomain}/p/{p.slug}</div>
              <div className="text-zinc-900 font-black">{p.price} دج</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button onClick={() => toggleActive(p)} className={`text-xs px-3 py-1 rounded-full font-bold border ${p.is_active ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-300"}`}>{p.is_active ? "✓ نشط" : "مخفي"}</button>
                <button onClick={() => { const url = `https://${BASE}/${subdomain}/p/${p.slug}`; navigator.clipboard.writeText(url); alert("تم نسخ: " + url); }} className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-full font-bold hover:bg-black">نسخ الرابط المجاني</button>
                <button onClick={async () => { if (confirm("حذف المنتج؟")) { await supabase.from("products").delete().eq("id", p.id); load(); } }} className="text-xs bg-white border-2 border-zinc-300 px-3 py-1 rounded-full font-bold hover:bg-zinc-50">حذف</button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="text-center text-zinc-600 font-medium p-8 md:col-span-2 bg-white rounded-2xl border-2 border-dashed border-zinc-300">لا منتجات بعد — أضف أول منتج أعلاه</div>}
      </div>
    </div>
  );
}
