import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN || "coddz.com";

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

  const navItems = [
    { href: "/dashboard", label: "الإحصائيات", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/dashboard/products", label: "المنتجات", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { href: "/dashboard/orders", label: "الطلبات", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { href: "/dashboard/blacklists", label: "القائمة السوداء", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    { href: "/dashboard/coupons", label: "كوبونات", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { href: "/dashboard/settings/shipping", label: "الشحن", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    { href: "/dashboard/settings/billing", label: "الفوترة", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-primary text-white p-5 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-white text-primary flex items-center justify-center font-black text-sm">C</div>
          <span className="font-black text-base">{merchant.business_name}</span>
        </div>
        <nav className="space-y-0.5 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card/20 transition text-muted-soft hover:text-foreground">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/subscriptions" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/20 border border-card/30 text-muted-soft hover:text-foreground hover:bg-card/30 transition mt-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              لوحة الأدمن
            </Link>
          )}
        </nav>
        <div className="mt-auto pt-4 border-t border-card/20">
          <a href={`https://${BASE}/${merchant.subdomain}`} target="_blank" className="flex items-center justify-center gap-2 bg-card text-primary text-sm font-bold rounded-lg py-2 hover:bg-card/5 transition">
            عرض المتجر ↗
          </a>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border bg-card px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-foreground">{merchant.business_name}</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden sm:inline text-sm text-muted-soft">{user.email}</span>
            <form action={async () => { "use server"; const s = await createClient(); await s.auth.signOut(); redirect("/login"); }}>
              <button className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-soft hover:bg-border transition">خروج</button>
            </form>
          </div>
        </header>
        <main className="p-6 flex-1 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}