import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export function CatalogListingSkeleton() {
  return (
    <Container className="py-10 sm:py-14">
      <Skeleton className="h-4 w-52" />
      <Skeleton className="mt-8 h-14 w-full max-w-xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      <Skeleton className="mt-10 h-16 w-full rounded-none" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="hidden space-y-4 lg:block">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-14 rounded-none" />)}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3">{Array.from({ length: 9 }, (_, index) => <div key={index}><Skeleton className="aspect-[4/5] rounded-none" /><Skeleton className="mt-4 h-3 w-20" /><Skeleton className="mt-2 h-6 w-4/5" /><Skeleton className="mt-2 h-4 w-28" /></div>)}</div>
      </div>
    </Container>
  );
}

