import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() { return <main id="main-content" className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 lg:grid-cols-2" role="status" aria-live="polite"><span className="sr-only">Memuat detail produk…</span><Skeleton className="aspect-[4/5] w-full rounded-none" /><div className="space-y-5"><Skeleton className="h-4 w-28" /><Skeleton className="h-14 w-4/5" /><Skeleton className="h-6 w-40" /><Skeleton className="mt-10 h-12 w-full" /><Skeleton className="h-12 w-full" /></div></main>; }
