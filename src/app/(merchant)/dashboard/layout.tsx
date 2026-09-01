import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconStore, IconPackage, IconTruck, IconShield } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN || "coddz.com";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = (user.email?.toLowerCase() || "") === "kinezedge@gmail.com" || (process.env.ADMIN_EMAILS || "").split(",").map(s=>s.trim().toLowerCase()).includes(user.email?.toLowerCase() || "");
  const { data: membership } = await supabase.from("merchant_members").select("merchant_id, merchants(business_name, subdomain, subscription_status, trial_ends_at, subscription_ends_at)").eq("user_id", user.id).single();
  if (!membership) {
    if (isAdmin) redirect("/admin/subscriptions");
    redirect("/register");
  }

  const merchant = membership.merchants as unknown as { business_name: string; subdomain: string; subscription_status: string; trial_ends_at: string; subscription_ends_at: string };
  const isExpired = false; // مجاني 100% — لا انتهاء

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <aside className="w-72 bg-zinc-900 text-white p-7 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-white text-zinc-900 flex items-center justify-center font-black">C</div>
          <span className="font-black text-lg tracking-tight">{merchant.business_name}</span>
        </div>
        <nav className="space-y-1.5 text-[15px] font-medium">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"><IconStore className="w-5 h-5" /> الإحصائيات</Link>
          <Link href="/dashboard/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"><IconPackage className="w-5 h-5" /> المنتجات</Link>
          <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"><IconPackage className="w-5 h-5" /> الطلبات</Link>
          <Link href="/dashboard/settings/store" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"><IconStore className="w-5 h-5" /> تخصيص المتجر</Link>
          <Link href="/dashboard/blacklists" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"><IconShield className="w-5 h-5" /> القائمة السوداء</Link>
          <Link href="/dashboard/coupons" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"><IconShield className="w-5 h-5" /> كوبونات</Link>
          <Link href="/dashboard/settings/shipping" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"><IconTruck className="w-5 h-5" /> الشحن</Link>
          <Link href="/dashboard/settings/billing" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"><IconShield className="w-5 h-5" /> الفوترة</Link>
          {isAdmin && <Link href="/admin/subscriptions" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition bg-white/5 border border-white/10"><IconStore className="w-5 h-5" /> لوحة الأدمن</Link>}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
          <div className="text-xs font-bold text-zinc-400">متجرك</div>
          <div className="text-sm font-mono text-white font-bold" dir="ltr">{BASE}/{merchant.subdomain}</div>
          <a href={`https://${BASE}/${merchant.subdomain}`} target="_blank" className="inline-flex items-center gap-2 w-full justify-center bg-white text-zinc-900 py-2.5 rounded-xl text-sm font-black hover:bg-zinc-100 transition">عرض المتجر <span aria-hidden>↗</span></a>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-zinc-200 px-8 py-5 flex justify-between items-center">
          <div className="font-black text-zinc-900 text-lg">لوحة التحكم</div>
          <div className="flex items-center gap-3 text-sm">
            <ThemeToggle />
            <span className="hidden sm:inline font-medium text-zinc-700">{user.email}</span>
            <form action={async () => { "use server"; const s = await createClient(); await s.auth.signOut(); redirect("/login"); }}>
              <button className="px-4 py-2 rounded-full border-2 border-zinc-300 font-bold hover:bg-zinc-50 transition">خروج</button>
            </form>
          </div>
        </header>
        <div className="bg-zinc-900 text-white px-8 py-3 flex items-center justify-center gap-3 text-sm">
          <span className="font-mono bg-white text-zinc-900 px-3 py-1 rounded-lg font-bold" dir="ltr">{BASE}/{merchant.subdomain}</span>
          <a href={`https://${BASE}/${merchant.subdomain}`} target="_blank" className="hidden sm:inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold transition">عرض المتجر ↗</a>
        </div>
        <main className="p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
