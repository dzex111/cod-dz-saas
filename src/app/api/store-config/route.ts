import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get("merchantId");
  if (!merchantId) return NextResponse.json({ error: "merchantId required" }, { status: 400 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  // Direct fetch with no-store + timestamp bust
  const res = await fetch(`${url}/storage/v1/object/store-configs/${merchantId}.json?t=${Date.now()}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
    // @ts-ignore
    next: { revalidate: 0 },
  } as any);
  if (!res.ok) {
    return NextResponse.json({ config: null }, { headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" } });
  }
  try {
    const json = await res.json();
    return NextResponse.json({ config: json }, { headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ config: null }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const { merchantId, config } = body;
  if (!merchantId || !config) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });

  // verify membership
  const { data: mem } = await supabase.from("merchant_members").select("merchant_id").eq("user_id", user.id).eq("merchant_id", merchantId).single();
  if (!mem) return NextResponse.json({ error: "ليست عضواً" }, { status: 403 });

  const admin = getAdmin();
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const arrayBuf = await blob.arrayBuffer();
  const { error } = await admin.storage.from("store-configs").upload(`${merchantId}.json`, arrayBuf, { upsert: true, contentType: "application/json", cacheControl: "0" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Also purge cache by re-uploading with same content but different cacheControl already handled
  return NextResponse.json({ success: true });
}
