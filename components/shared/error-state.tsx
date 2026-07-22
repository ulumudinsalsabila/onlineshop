import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

export function ErrorState({ title = "Something went wrong", description, action, className }: { title?: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border-destructive/30 bg-destructive/5 flex flex-col items-center border p-8 text-center", className)} role="alert">
      <WarningCircleIcon className="text-destructive mb-4" size={28} weight="light" aria-hidden />
      <h3 className="font-serif text-2xl font-medium">{title}</h3>
      {description ? <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
