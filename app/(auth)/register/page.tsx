import type { Metadata } from "next";

import { AuthForm, AuthShell } from "@/features/auth";

export const metadata: Metadata = { title: "Create account" };
export default function RegisterPage() { return <AuthShell eyebrow="Private membership" title="Create your account." description="Simpan pilihan, kelola pengiriman, dan ikuti setiap detail pesanan dalam satu tempat."><AuthForm mode="register" /></AuthShell>; }
