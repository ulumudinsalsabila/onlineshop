"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export function RouteError({ reset, title = "This page could not be loaded" }: { reset: () => void; title?: string }) {
  return <ErrorState title={title} description="A temporary issue occurred. Your data remains safe; please try again." action={<Button type="button" onClick={reset}><ArrowClockwiseIcon aria-hidden />Try again</Button>} />;
}
