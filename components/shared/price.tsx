import { formatIDR } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface PriceProps {
  amount: number;
  compareAt?: number;
  className?: string;
}

export function Price({ amount, compareAt, className }: PriceProps) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-2 tabular-nums", className)}>
      <span className="font-medium">{formatIDR(amount)}</span>
      {compareAt && compareAt > amount ? (
        <del className="text-muted-foreground text-sm">{formatIDR(compareAt)}</del>
      ) : null}
    </span>
  );
}
