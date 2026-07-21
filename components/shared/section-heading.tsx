import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ title, description, eyebrow, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow}</p> : null}
      <h2 className="font-serif text-(length:--text-heading-2) leading-[0.98] font-medium tracking-[-0.025em] text-balance">{title}</h2>
      {description ? <p className={cn("text-muted-foreground max-w-2xl leading-7 text-pretty", align === "center" && "mx-auto")}>{description}</p> : null}
    </div>
  );
}
