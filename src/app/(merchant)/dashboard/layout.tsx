import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardNav, { DashboardNavMobile } from "@/components/DashboardNav";

const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN || "cod-dz-saas.vercel.app";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = (user.email?.toLowerCase() || "") === "kinezedge@gmail.com" || (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).includes(user.email?.toLowerCase() || "");
  const { data: membership } = await supabase.from("merchant_members").select("merchant_id, merchants(business_name, subdomain, subscription_status)").eq("user_id", user.id).single();
  if (!membership) {
    if (isAdmin) redirect("/admin/subscriptions");
    redirect("/register");
  }

  const merchant = membership.merchants as unknown as { business_name: string; subdomain: string; subscription_status: string };

  const nav = [
    { href: "/dashboard", label: "الرئيسية", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/dashboard/orders", label: "الطلبات", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { href: "/dashboard/products", label: "المنتجات", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { href: "/dashboard/blacklists", label: "القائمة السوداء", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    { href: "/dashboard/coupons", label: "الكوبونات", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { href: "/dashboard/settings/store", label: "تخصيص المتجر", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
    { href: "/dashboard/settings/shipping", label: "الشحن", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    { href: "/dashboard/settings/billing", label: "الفوترة", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — Light, alive, editorial */}
      <aside className="w-[280px] bg-card border-e border-border hidden lg:flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">O</div>
            <div>
              <div className="font-bold text-[15px] leading-none tracking-tight text-ink">ORDELY</div>
              <div className="text-[11px] font-semibold tracking-widest text-muted-soft uppercase">COD Operations</div>
            </div>
          </Link>
        </div>

        <div className="mx-4 p-3 rounded-xl bg-background border border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">{merchant.business_name[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate leading-none">{merchant.business_name}</div>
              <div className="text-xs text-muted font-mono truncate" dir="ltr">{merchant.subdomain}.{BASE}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          <a href={`https://${BASE}/${merchant.subdomain}`} target="_blank" className="mt-3 flex items-center justify-center gap-1.5 w-full bg-primary text-white rounded-lg py-2 text-xs font-medium hover:bg-primary-hover transition-colors">
            View store ↗
          </a>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-medium tracking-widest text-muted uppercase px-3 mb-2">Menu</div>
          <DashboardNav items={nav} />

          {isAdmin && (
            <Link href="/admin/subscriptions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold mt-4">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> لوحة الأدمن
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">{user.email?.[0]?.toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">{user.email}</div>
              <div className="text-[11px] text-emerald-600 font-bold">● متصل</div>
            </div>
            <form action={async () => { "use server"; const s = await createClient(); await s.auth.signOut(); redirect("/login"); }}>
              <button className="p-2 rounded-xl hover:bg-card-hover border border-transparent hover:border-border transition-colors" title="خروج">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">O</div>
            <span className="font-bold text-sm">ORDELY</span>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          
        </div>
        <div className="flex gap-1.5 px-3 pb-3 overflow-x-auto">
          <DashboardNavMobile items={nav} />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col lg:pt-0 pt-[92px]">
        {/* Top bar — alive with search + actions */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-black text-lg leading-none">مرحباً، {merchant.business_name} </h1>
            <p className="text-xs text-muted mt-1">هذا ما يحدث في متجرك اليوم</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-card border border-border rounded-full pl-2 pr-4 py-1.5 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-soft" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z" /></svg>
              <input placeholder="بحث في الطلبات..." className="bg-transparent outline-none text-sm w-32 placeholder:text-muted-soft" />
              <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono">K</span>
            </div>
            
            <button className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card-hover transition-colors relative">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card" />
            </button>
          </div>
        </header>

        <main className="p-6 max-w-[1200px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
