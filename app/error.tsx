"use client";

import { RouteError } from "@/components/shared/route-error";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main id="main-content" className="mx-auto grid min-h-[70svh] max-w-3xl place-items-center px-5"><RouteError reset={reset} /></main>; }
