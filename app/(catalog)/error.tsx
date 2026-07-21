"use client";

import { useEffect } from "react";

import { Container } from "@/components/shared/container";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export default function CatalogError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return <Container className="py-(--space-section)"><ErrorState title="The catalogue could not be loaded" description="A temporary issue occurred while preparing the selection. Please try again." action={<Button onClick={unstable_retry}>Try again</Button>} className="min-h-96" /></Container>;
}
