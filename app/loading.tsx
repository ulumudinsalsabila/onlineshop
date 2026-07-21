import { LoadingState } from "@/components/shared/loading-state";

export default function Loading() { return <main id="main-content" className="mx-auto min-h-[65svh] max-w-[1440px] px-5 py-12"><LoadingState rows={3} className="sm:grid-cols-2 lg:grid-cols-3" /></main>; }
