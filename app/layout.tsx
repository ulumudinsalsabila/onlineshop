import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { MotionProvider } from "@/components/shared/motion-provider";
import { CommerceProvider } from "@/components/shared/commerce-provider";
import { StorefrontShell } from "@/components/layout";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const editorialFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Maison Élan", template: "%s — Maison Élan" },
  description: "Pilihan fashion premium dengan sudut pandang modern dan editorial.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${bodyFont.variable} ${editorialFont.variable}`}>
      <body>
        <a href="#main-content" className="fixed top-2 left-2 z-[110] -translate-y-20 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform focus:translate-y-0">Lewati ke konten utama</a>
        <MotionProvider><CommerceProvider><StorefrontShell>{children}</StorefrontShell></CommerceProvider></MotionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
