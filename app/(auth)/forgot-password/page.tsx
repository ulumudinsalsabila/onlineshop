import type { Metadata } from "next";

import { AuthForm, AuthShell } from "@/features/auth";

export const metadata: Metadata = { title: "Forgot password" };
export default function ForgotPasswordPage() { return <AuthShell eyebrow="Account recovery" title="Reset your password." description="Enter your account email. If it is registered, we will send a link valid for one hour."><AuthForm mode="forgot" /></AuthShell>; }
