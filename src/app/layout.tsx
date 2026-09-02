import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COD DZ - منصة إدارة تجارة الدفع عند الاستلام",
  description: "منصة جزائرية احترافية لإدارة متاجر الدفع عند الاستلام - ربط Yalidine، إدارة الطلبات، والقائمة السوداء",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/15">
        {children}
      </body>
    </html>
  );
}
