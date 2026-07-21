import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Wishlist", description: "Pieces you have saved to revisit later.", robots: { index: false, follow: false, nocache: true } };

export default function Page() { redirect("/account/wishlist"); }
