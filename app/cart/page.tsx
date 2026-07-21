import type { Metadata } from "next";

import { CartPage } from "@/features/cart";
import { StorefrontShell } from "@/components/layout";

export const metadata: Metadata = { title: "Shopping Bag", description: "Tinjau produk, quantity, voucher, dan total belanja Anda.", robots: { index: false, follow: false, nocache: true } };

export default function Page() { return <StorefrontShell><CartPage /></StorefrontShell>; }
