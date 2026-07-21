import type { Metadata } from "next";

import { StorefrontShell } from "@/components/layout";
import { Container } from "@/components/shared/container";
import { CheckoutFlow } from "@/features/checkout";
import { requireUser } from "@/lib/auth-guard";

export const metadata: Metadata = { title: "Checkout", description: "Complete delivery and payment for your order." };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  await requireUser();
  return <StorefrontShell><Container className="py-10 lg:py-16"><CheckoutFlow /></Container></StorefrontShell>;
}
