export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="bg-card rounded-2xl p-10 border border-border max-w-md">
        <div className="text-5xl mb-4">🏪</div>
        <h1 className="text-2xl font-extrabold text-foreground">المتجر غير موجود</h1>
        <p className="text-muted-soft mt-2">تأكد من رابط المتجر أو تواصل مع صاحب المتجر.</p>
      </div>
    </div>
  );
}