import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  // ping مجاني يمنع Supabase Pause (يستدعيه cron-job.org يومياً)
  try {
    const admin = createAdminClient();
    await admin.from("merchants").select("id").limit(1).maybeSingle();
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
