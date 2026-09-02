"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

export default function DashboardNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary-light text-primary border border-primary/10" : "text-muted hover:text-ink hover:bg-subtle"}`}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function DashboardNavMobile({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((i) => {
        const isActive = pathname === i.href || (i.href !== "/dashboard" && pathname.startsWith(i.href));
        return (
          <Link key={i.href} href={i.href} className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${isActive ? "bg-primary text-white border-primary" : "bg-white border-border text-muted"}`}>{i.label}</Link>
        );
      })}
    </>
  );
}
