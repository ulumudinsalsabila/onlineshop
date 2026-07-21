"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export function RouteError({ reset, title = "Halaman tidak dapat dimuat" }: { reset: () => void; title?: string }) {
  return <ErrorState title={title} description="Terjadi kendala sementara. Data Anda tetap aman; silakan coba kembali." action={<Button type="button" onClick={reset}><ArrowClockwiseIcon aria-hidden />Coba lagi</Button>} />;
}
