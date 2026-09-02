"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-border bg-card animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label="تبديل الوضع"
      className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-card-hover hover:border-border-strong transition-colors duration-200 shadow-sm"
      title={theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
    >
      {theme === "light" ? (
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-foreground" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
