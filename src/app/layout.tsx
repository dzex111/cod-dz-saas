import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COD DZ - منصة إدارة تجارة الدفع عند الاستلام",
  description: "منصة جزائرية لإدارة متاجر الدفع عند الاستلام - ربط Yalidine، إدارة الطلبات، والقائمة السوداء",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
