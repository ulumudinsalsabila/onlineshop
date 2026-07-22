"use client";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error; reset(): void }) { return <div className="grid min-h-[60vh] place-items-center text-center"><div><WarningCircleIcon className="mx-auto size-12 text-destructive" aria-hidden /><h1 className="mt-4 font-serif text-4xl">Dashboard unavailable</h1><p className="mt-3 text-sm text-muted-foreground">The data could not be loaded. Check the database connection and try again.</p><Button className="mt-6" onClick={reset}>Try again</Button></div></div>; }
