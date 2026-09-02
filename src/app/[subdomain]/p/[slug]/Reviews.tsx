"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Review = { id: string; customer_name: string; rating: number; comment: string | null; created_at: string };

export default function Reviews({ productId, merchantId }: { productId: string; merchantId: string }) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await supabase.from("reviews").select("*").eq("product_id", productId).eq("is_approved", true).order("created_at", { ascending: false }).limit(20);
    if (data) setReviews(data as Review[]);
  }
  useEffect(() => { load(); }, [productId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.rating < 1) { setMsg("الاسم والتقييم مطلوب"); return; }
    const { error } = await supabase.from("reviews").insert({ merchant_id: merchantId, product_id: productId, customer_name: form.name.trim(), rating: Number(form.rating), comment: form.comment.trim() || null });
    if (error) setMsg(error.message);
    else { setMsg(" شكراً — تم نشر تقييمك"); setForm({ name: "", rating: 5, comment: "" }); load(); }
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-foreground">آراء الزبائن</h3>
        {avg && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold"> {avg} ({reviews.length})</span>}
      </div>
      <div className="space-y-2">
        {reviews.map(r => (
          <div key={r.id} className="border border-border rounded-xl p-3.5 bg-background">
            <div className="flex justify-between items-center"><span className="font-bold text-sm text-foreground">{r.customer_name}</span><span className="text-sm font-medium text-ink border border-border px-2 py-0.5 rounded-full">{r.rating}/5</span></div>
            {r.comment && <div className="text-sm text-muted mt-1.5 leading-6">{r.comment}</div>}
            <div className="text-xs text-muted-soft mt-1">{new Date(r.created_at).toLocaleDateString("ar-DZ")}</div>
          </div>
        ))}
        {reviews.length === 0 && <div className="text-center text-muted-soft text-sm py-6 bg-background rounded-xl border border-dashed border-border">لا تقييمات بعد — كن أول من يقيم</div>}
      </div>
      <form onSubmit={submit} className="border-t border-border pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="اسمك" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-border rounded-xl px-3.5 py-3 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm" />
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="border border-border rounded-xl px-3 py-3 bg-background font-bold focus:border-primary outline-none text-sm">
            <option value={5}>5/5</option>
            <option value={4}>4/5</option>
            <option value={3}>3/5</option>
            <option value={2}>2/5</option>
            <option value={1}>1/5</option>
          </select>
        </div>
        <textarea placeholder="تعليق (اختياري)" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={2} className="w-full border border-border rounded-xl px-3.5 py-3 bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition text-sm" />
        <button className="w-full bg-primary text-white rounded-xl py-3 font-bold hover:bg-primary-hover transition-colors shadow-sm">نشر التقييم</button>
        {msg && <div className="text-center text-sm font-bold text-emerald-600">{msg}</div>}
      </form>
    </div>
  );
}
