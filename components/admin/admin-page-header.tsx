import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

export function AdminPageHeader({ title, description, action, breadcrumbs = [] }: { title: string; description?: string; action?: React.ReactNode; breadcrumbs?: { label: string; href?: string }[] }) {
  return <header className="mb-7"><nav aria-label="Breadcrumb"><ol className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#77736b]"><li><Link href="/admin" className="hover:text-foreground">Admin</Link></li>{breadcrumbs.map((item) => <li key={item.label} className="flex items-center gap-2"><CaretRightIcon aria-hidden />{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-4xl leading-none sm:text-5xl">{title}</h1>{description && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d6961]">{description}</p>}</div>{action}</div></header>;
}
