"use client";
import { RouteError } from "@/components/shared/route-error";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <RouteError reset={reset} title="Your account could not be loaded" />; }
