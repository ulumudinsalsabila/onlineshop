import Link from "next/link";

import { StorefrontShell } from "@/components/layout";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() { return <StorefrontShell><div className="mx-auto grid min-h-[60svh] max-w-3xl place-items-center px-5 py-16"><EmptyState title="Page not found" description="The address may have changed, or the collection is no longer available." action={<Button asChild><Link href="/products">Explore the collection</Link></Button>} /></div></StorefrontShell>; }
