"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignOutIcon, SpinnerGapIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { apiFetch, clearApiAccessToken } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try { await apiFetch("/auth/logout", { method: "POST" }); }
    finally {
      clearApiAccessToken();
      router.replace("/login");
      router.refresh();
      setPending(false);
    }
  }

  return <Button type="button" variant="ghost" className="mt-4 w-full justify-start" disabled={pending} onClick={() => void logout()}>{pending ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <SignOutIcon aria-hidden />}Logout</Button>;
}

