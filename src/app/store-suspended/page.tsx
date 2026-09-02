import Link from "next/link";

export default function StoreSuspended() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="bg-card rounded-[24px] p-10 border border-border shadow-sm max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">⏸️</div>
        <h1 className="text-xl font-black text-foreground">المتجر موقوف مؤقتاً</h1>
        <p className="text-sm text-muted mt-2 leading-6">انتهت فترة الاشتراك أو التجربة. على صاحب المتجر تجديد الاشتراك لإعادة التفعيل.</p>
        <Link href="/" className="inline-block mt-6 px-6 py-2.5 bg-ink text-white rounded-full text-sm font-bold hover:bg-ink-hover transition-colors">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
