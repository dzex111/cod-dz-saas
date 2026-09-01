import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const formData = await req.formData();
  const reference = formData.get("reference") as string;
  const amount = formData.get("amount") as string;
  const proofFile = formData.get("proof_image") as File | null;

  if (!reference || !amount) return NextResponse.json({ error: "المرجع والمبلغ مطلوبان" }, { status: 400 });
  if (!proofFile) return NextResponse.json({ error: "صورة الإيصال مطلوبة" }, { status: 400 });

  const { data: membership } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "لا يوجد متجر مرتبط" }, { status: 403 });

  const filePath = `${membership.merchant_id}/${Date.now()}-${proofFile.name}`;
  const { error: uploadError } = await supabase.storage.from("baridimob-proofs").upload(filePath, proofFile);
  if (uploadError) return NextResponse.json({ error: "فشل رفع الصورة: " + uploadError.message }, { status: 500 });

  const { error } = await supabase.from("subscription_payments").insert({
    merchant_id: membership.merchant_id,
    payment_method: "baridimob",
    transaction_reference: reference,
    amount: Number(amount),
    proof_image_path: filePath,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: "فشل حفظ طلب الدفع: " + error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: "تم رفع الإيصال، سيتم المراجعة خلال دقائق" });
}
