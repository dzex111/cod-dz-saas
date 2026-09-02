"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border-2 border-zinc-200 p-8 text-center max-w-md">
        <div className="w-14 h-14 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-black text-zinc-900 text-lg">حدث خطأ</h2>
        <p className="text-sm text-zinc-600 mt-2 font-medium">
          {error.message || "حدث خطأ غير متوقع — حاول مرة أخرى"}
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-400 mt-1 font-mono" dir="ltr">
            {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="mt-5 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-black transition"
        >
          حاول مرة أخرى
        </button>
      </div>
    </div>
  );
}
