import type { Metadata } from "next";

import { StorefrontShell } from "@/components/layout";
import { WishlistPage } from "@/features/wishlist";

export const metadata: Metadata = { title: "Wishlist", description: "Pieces you have saved to revisit later.", robots: { index: false, follow: false, nocache: true } };

export default function Page() {
  return <StorefrontShell><WishlistPage /></StorefrontShell>;
}
