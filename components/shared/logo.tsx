import Image from "next/image";

import { SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("relative inline-block shrink-0 overflow-hidden", compact ? "h-[1.82rem] w-28 sm:h-[2.08rem] sm:w-32" : "h-[2.08rem] w-32", className)} aria-label={SITE_CONFIG.name} role="img">
      <Image
        src="/logo.png"
        alt=""
        width={740}
        height={337}
        className={cn("pointer-events-none absolute h-auto max-w-none select-none", compact ? "-top-[1.45rem] -left-[1.84rem] w-[10.25rem] sm:-top-[1.66rem] sm:-left-[2.1rem] sm:w-[11.72rem]" : "-top-[1.66rem] -left-[2.1rem] w-[11.72rem]")}
      />
    </span>
  );
}
