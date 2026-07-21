import type { Metadata } from "next";

import { WishlistPage } from "@/features/wishlist";

export const metadata: Metadata = { title: "Wishlist", description: "Produk pilihan yang Anda simpan untuk dilihat kembali." };

export default function Page() { return <WishlistPage />; }

