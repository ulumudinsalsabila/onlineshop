import { redirect } from "next/navigation";
import { backendApi } from "@/lib/backend-api";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
  const { email = "", token = "" } = await searchParams;
  let verified = false;
  try { await backendApi(`/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, { cache: "no-store" }); verified = true; } catch { /* handled by redirect */ }
  redirect(verified ? "/login?verified=true" : "/login?error=invalid-token");
}
