"use client";

import { useState } from "react";
import { SignOutIcon, SpinnerGapIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { apiFetch, clearApiAccessToken } from "@/lib/api-client";
import { backendApiUrl } from "@/lib/api-url";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  function logout() {
    if (pending) return;
    setPending(true);
    try {
      void apiFetch(backendApiUrl("/auth/logout"), { method: "POST", keepalive: true }).catch(() => undefined);
    } finally {
      clearApiAccessToken();
      window.location.replace("/login");
    }
  }

  return <Button type="button" variant="ghost" className="mt-4 w-full justify-start" disabled={pending} onClick={logout}>{pending ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <SignOutIcon aria-hidden />}Logout</Button>;
}
