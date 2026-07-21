"use client";
import { RouteError } from "@/components/shared/route-error";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main id="main-content" className="mx-auto max-w-3xl px-5 py-16"><RouteError reset={reset} title="Checkout could not be loaded" /></main>; }
