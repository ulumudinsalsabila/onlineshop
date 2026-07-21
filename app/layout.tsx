import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { MotionProvider } from "@/components/shared/motion-provider";
import { CommerceProvider } from "@/components/shared/commerce-provider";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/shared/json-ld";
import { SITE_CONFIG } from "@/constants/site";
import { DEFAULT_OG_IMAGE, SITE_URL, absoluteUrl } from "@/lib/seo";

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
  metadataBase: SITE_URL,
  title: { default: "IVORY", template: "%s — IVORY" },
  description: "Pilihan fashion premium dengan sudut pandang modern dan editorial.",
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.name, url: SITE_URL }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  keywords: ["fashion premium", "preloved authenticated", "tas premium", "sepatu premium", "Indonesia"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "id_ID", url: "/", siteName: SITE_CONFIG.name, title: SITE_CONFIG.name, description: SITE_CONFIG.description, images: [{ url: DEFAULT_OG_IMAGE, alt: "IVORY curated fashion" }] },
  twitter: { card: "summary_large_image", title: SITE_CONFIG.name, description: SITE_CONFIG.description, images: [DEFAULT_OG_IMAGE] },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f3eb", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${bodyFont.variable} ${editorialFont.variable}`}>
      <body>
        <a href="#main-content" className="fixed top-2 left-2 z-[110] -translate-y-20 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform focus:translate-y-0">Lewati ke konten utama</a>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE_CONFIG.name, url: absoluteUrl("/"), logo: absoluteUrl("/logo.png"), email: "care@ivory.id", contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", availableLanguage: ["id", "en"] }] }} />
        <MotionProvider><CommerceProvider>{children}</CommerceProvider></MotionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
