import type { Metadata } from "next";

import { AuthForm, AuthShell } from "@/features/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; verified?: string; error?: string }> }) {
  const params = await searchParams;
  return <AuthShell eyebrow="Welcome back" title="Sign in to your account." description="Access your orders, addresses, wishlist, and a more personal shopping experience."><AuthForm mode="login" callbackUrl={params.callbackUrl} verified={params.verified === "true"} invalidToken={params.error === "invalid-token"} /></AuthShell>;
}
