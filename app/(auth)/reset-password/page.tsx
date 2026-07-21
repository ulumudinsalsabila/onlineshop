import type { Metadata } from "next";

import { AuthForm, AuthShell } from "@/features/auth";

export const metadata: Metadata = { title: "Reset password" };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) { const { email = "", token = "" } = await searchParams; return <AuthShell eyebrow="Account recovery" title="Choose a new password." description="Gunakan password unik dengan kombinasi huruf besar, huruf kecil, dan angka."><AuthForm mode="reset" email={email} token={token} /></AuthShell>; }
