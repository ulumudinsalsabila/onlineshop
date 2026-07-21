import type { Icon } from "@phosphor-icons/react";
import { PackageIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: Icon;
  className?: string;
}

export function EmptyState({ title, description, action, icon: Icon = PackageIcon, className }: EmptyStateProps) {
  return (
    <div className={cn("border-border flex min-h-64 flex-col items-center justify-center border border-dashed bg-secondary/25 p-8 text-center", className)}>
      <span className="bg-secondary mb-5 grid size-12 place-items-center rounded-full">
        <Icon size={24} weight="light" aria-hidden />
      </span>
      <h3 className="font-serif text-2xl font-medium">{title}</h3>
      {description ? <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
