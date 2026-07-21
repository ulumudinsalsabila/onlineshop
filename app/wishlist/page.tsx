import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Wishlist", description: "Produk pilihan yang Anda simpan untuk dilihat kembali.", robots: { index: false, follow: false, nocache: true } };

export default function Page() { redirect("/account/wishlist"); }
