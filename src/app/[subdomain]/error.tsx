"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="bg-white rounded-xl border-2 border-zinc-200 p-8 text-center max-w-md">
        <div className="text-4xl mb-3"></div>
        <h1 className="font-black text-zinc-900 text-lg">خطأ في المتجر</h1>
        <p className="text-sm text-zinc-600 mt-2 font-medium">
          {error.message || "حدث خطأ — حاول مرة أخرى"}
        </p>
        <div className="mt-5 flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-black transition"
          >
            حاول مرة أخرى
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border-2 border-zinc-300 rounded-xl text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition"
          >
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
