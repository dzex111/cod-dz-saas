import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateSession } from "@/lib/supabase/middleware";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "ordely.com";

// كاش مجاني في الذاكرة لتقليل استهلاك Supabase (60 ثانية) — مع حد أقصى
const merchantCache = new Map<string, { merchant: { id: string; subscription_status: string; trial_ends_at: string; subscription_ends_at: string } | null; expires: number }>();
const MAX_CACHE_SIZE = 500;
function cleanupCache() {
  if (merchantCache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, val] of merchantCache) {
      if (now > val.expires) merchantCache.delete(key);
    }
    // إذا لا يزال كبيراً، احذف الأقدم
    if (merchantCache.size > MAX_CACHE_SIZE) {
      const entries = [...merchantCache.entries()].sort((a, b) => a[1].expires - b[1].expires);
      for (let i = 0; i < Math.floor(entries.length * 0.3); i++) merchantCache.delete(entries[i][0]);
    }
  }
}

export async function middleware(request: NextRequest) {
  // First update supabase session
  const sessionResponse = await updateSession(request);

  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Allow Next internal and static, api, _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/store-not-found") ||
    pathname.startsWith("/store-suspended") ||
    pathname.includes(".")
  ) {
    return sessionResponse;
  }

  // تجاهل النطاق الرئيسي
  const isMainDomain =
    host === BASE_DOMAIN ||
    host === `www.${BASE_DOMAIN}` ||
    host.includes("localhost") ||
    host.includes("vercel.app") ||
    host.includes("127.0.0.1");

  if (isMainDomain) {
    return sessionResponse;
  }

  // استخراج subdomain
  let subdomain: string | null = null;
  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    subdomain = host.replace(`.${BASE_DOMAIN}`, "");
  } else {
    // Fallback: try to extract first part as subdomain for vercel preview etc
    // For testing locally we support ?subdomain= query or header
    subdomain = request.headers.get("x-subdomain") || null;
  }

  if (!subdomain) {
    return sessionResponse;
  }

  // Use cache أولاً (مجاني) — مع تنظيف
  cleanupCache();
  const now = Date.now();
  const cached = merchantCache.get(subdomain);
  let merchant: { id: string; subscription_status: string; trial_ends_at: string; subscription_ends_at: string } | null = null;
  if (cached && cached.expires > now) {
    merchant = cached.merchant;
  } else {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabaseAdmin
      .from("merchants")
      .select("id, subscription_status, trial_ends_at, subscription_ends_at")
      .eq("subdomain", subdomain)
      .single();
    merchant = data as typeof merchant;
    merchantCache.set(subdomain, { merchant, expires: now + 60_000 });
  }

  if (!merchant) {
    return NextResponse.rewrite(new URL("/store-not-found", request.url));
  }

  // وضع مجاني 100% — لا حجب إطلاقاً (يمكن تفعيل الحجب لاحقاً عند الحاجة)
  // const isExpired = ... (معطل للمجانية)
  const isExpired = false;
  if (isExpired) {
    return NextResponse.rewrite(new URL("/store-suspended", request.url), {
      status: 402,
    });
  }

  // إعادة التوجيه الداخلي
  url.pathname = `/${subdomain}${pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("x-merchant-id", merchant.id);
  // copy supabase cookies
  sessionResponse.cookies.getAll().forEach((c) => response.cookies.set(c.name, c.value, c as never));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
