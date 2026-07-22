import type { ReactNode } from "react";
import type { Metadata } from "next";
import { SellerShell } from "@/components/seller/seller-shell";
import { requireSeller } from "@/lib/seller/auth";
import { privateMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seller", ...privateMetadata };
export default async function SellerLayout({ children }: { children: ReactNode }) {
  const { seller } = await requireSeller({ approved: false });
  return <SellerShell seller={seller}>{children}</SellerShell>;
}
