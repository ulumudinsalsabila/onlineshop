import type { Metadata } from "next";

import { AuthForm, AuthShell } from "@/features/auth";

export const metadata: Metadata = { title: "Create account" };
export default function RegisterPage() { return <AuthShell eyebrow="Private membership" title="Create your account." description="Save your selections, manage delivery, and follow every order detail in one place."><AuthForm mode="register" /></AuthShell>; }
