import type { Metadata } from "next";

import { CartPage } from "@/features/cart";
import { StorefrontShell } from "@/components/layout";

export const metadata: Metadata = { title: "Shopping Bag", description: "Review your products, quantities, voucher, and order total.", robots: { index: false, follow: false, nocache: true } };

export default function Page() { return <StorefrontShell><CartPage /></StorefrontShell>; }
