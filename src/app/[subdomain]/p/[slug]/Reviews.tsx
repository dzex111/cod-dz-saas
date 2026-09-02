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
    else { setMsg("✓ شكراً — تم نشر تقييمك"); setForm({ name: "", rating: 5, comment: "" }); load(); }
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="bg-card rounded-2xl border border-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-extrabold text-foreground">آراء الزبائن</h3>
        {avg && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">★ {avg} ({reviews.length})</span>}
      </div>
      <div className="space-y-2">
        {reviews.map(r => (
          <div key={r.id} className="border rounded-xl p-3 border-card">
            <div className="flex justify-between"><span className="font-bold text-sm">{r.customer_name}</span><span className="text-primary">{"★".repeat(r.rating)}</span></div>
            {r.comment && <div className="text-sm text-muted-soft mt-1">{r.comment}</div>}
            <div className="text-sm text-muted-soft">{new Date(r.created_at).toLocaleDateString("ar-DZ")}</div>
          </div>
        ))}
        {reviews.length === 0 && <div className="text-center text-muted-soft font-medium py-4">لا تقييمات بعد — كن أول من يقيم</div>}
      </div>
      <form onSubmit={submit} className="border-t pt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input required placeholder="اسمك" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-border rounded-xl px-3 py-3 bg-card text-foreground focus:border-primary outline-none" />
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="border border-border rounded-xl px-3 py-3 bg-card font-bold focus:border-primary outline-none">
            <option value={5}>★★★★★ 5</option>
            <option value={4}>★★★★ 4</option>
            <option value={3}>★★★ 3</option>
            <option value={2}>★★ 2</option>
            <option value={1}>★ 1</option>
          </select>
        </div>
        <textarea placeholder="تعليق (اختياري)" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={2} className="border border-border rounded-xl px-3 py-3 bg-card focus:border-primary outline-none" />
        <button className="w-full bg-card border border-primary rounded-xl py-3.5 font-bold text-primary hover:bg-primary/5 shadow-sm">نشر التقييم — مجاني</button>
        {msg && <div className="text-center text-sm font-bold text-primary">{msg}</div>}
      </form>
    </div>
  );
}