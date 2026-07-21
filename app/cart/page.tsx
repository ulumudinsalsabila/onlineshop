import type { Metadata } from "next";

import { CartPage } from "@/features/cart";

export const metadata: Metadata = { title: "Shopping Bag", description: "Tinjau produk, quantity, voucher, dan total belanja Anda." };

export default function Page() { return <CartPage />; }

