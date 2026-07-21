"use client";

import { useEffect } from "react";

import { Container } from "@/components/shared/container";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export default function CatalogError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return <Container className="py-(--space-section)"><ErrorState title="Katalog belum dapat dimuat" description="Terjadi gangguan sementara saat menyiapkan pilihan produk. Silakan coba kembali." action={<Button onClick={unstable_retry}>Coba lagi</Button>} className="min-h-96" /></Container>;
}

