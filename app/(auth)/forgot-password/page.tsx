import type { Metadata } from "next";

import { AuthForm, AuthShell } from "@/features/auth";

export const metadata: Metadata = { title: "Forgot password" };
export default function ForgotPasswordPage() { return <AuthShell eyebrow="Account recovery" title="Reset your password." description="Masukkan email akun Anda. Jika terdaftar, kami akan mengirim link yang berlaku selama satu jam."><AuthForm mode="forgot" /></AuthShell>; }
