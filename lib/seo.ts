import type { Metadata } from "next";

import { SITE_CONFIG } from "@/constants/site";

export const SITE_URL = validatedSiteUrl(process.env.NEXT_PUBLIC_APP_URL);
export const DEFAULT_OG_IMAGE = "/images/home/hero-home.png";

function validatedSiteUrl(configured: string | undefined) {
  const url = new URL(configured?.trim() || "http://localhost:3000");
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("NEXT_PUBLIC_APP_URL must be a valid HTTP(S) origin.");
  return new URL(url.origin);
}

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function publicMetadata(input: { title: string; description: string; path: string; image?: string; type?: "website" | "article" }): Metadata {
  const canonical = absoluteUrl(input.path);
  const image = input.image ?? DEFAULT_OG_IMAGE;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: { type: input.type ?? "website", locale: "id_ID", siteName: SITE_CONFIG.name, title: input.title, description: input.description, url: canonical, images: [{ url: image, alt: input.title }] },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [image] },
  };
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: absoluteUrl(item.href ?? "/") })),
  };
}
