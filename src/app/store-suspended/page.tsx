export default function StoreSuspended() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 text-center">
      <div className="bg-white rounded-3xl p-10 border max-w-md">
        <div className="text-5xl mb-4">⏸️</div>
        <h1 className="text-2xl font-bold">المتجر موقوف مؤقتاً</h1>
        <p className="text-zinc-600 mt-2">انتهت فترة الاشتراك أو التجربة. على صاحب المتجر تجديد الاشتراك لإعادة التفعيل.</p>
      </div>
    </div>
  );
}
