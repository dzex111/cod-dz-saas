import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORDELY — Every order, under control.",
  description: "ORDELY — The simple operating platform for COD stores in Algeria. Organize, verify and manage orders from one clear workspace.",
  openGraph: {
    title: "ORDELY — COD Operations Platform",
    description: "Every order, under control. The operating layer for COD stores.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
