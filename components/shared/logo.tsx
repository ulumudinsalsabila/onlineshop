import { SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 text-foreground", className)} aria-label={SITE_CONFIG.name}>
      <span className={cn("font-serif leading-none font-semibold tracking-[0.08em]", compact ? "text-xl sm:text-2xl" : "text-2xl")}>MAISON</span>
      <span className={cn("text-accent-foreground font-semibold tracking-[0.3em]", compact ? "text-[0.5rem] sm:text-[0.6rem]" : "text-[0.6rem]")}>ÉLAN</span>
    </span>
  );
}
