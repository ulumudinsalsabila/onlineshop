export function SellerPageHeader({ eyebrow = "Seller Studio", title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[0.625rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </header>
  );
}
