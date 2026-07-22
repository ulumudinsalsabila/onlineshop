"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as m from "motion/react-m";
import {
  BellIcon, CaretDoubleLeftIcon, ChartBarIcon, HouseIcon, ListIcon, MagnifyingGlassIcon, HandbagIcon,
  PackageIcon, ReceiptIcon, SignOutIcon, StorefrontIcon, TagIcon, TicketIcon, UserCircleIcon,
  UsersIcon, WarehouseIcon, ImageIcon, ShieldCheckIcon, XIcon,
} from "@phosphor-icons/react";

import type { UserRole } from "@/auth";
import type { AdminPermission } from "@/lib/admin/permissions";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavItem = { label: string; href: string; permission: AdminPermission; icon: typeof HouseIcon };
const navigation: NavItem[] = [
  { label: "Dashboard", href: "/admin", permission: "dashboard:read", icon: HouseIcon },
  { label: "Products", href: "/admin/products", permission: "products:read", icon: PackageIcon },
  { label: "Categories", href: "/admin/categories", permission: "categories:read", icon: ListIcon },
  { label: "Brands", href: "/admin/brands", permission: "brands:read", icon: TagIcon },
  { label: "Orders", href: "/admin/orders", permission: "orders:read", icon: ReceiptIcon },
  { label: "Customers", href: "/admin/customers", permission: "customers:read", icon: UsersIcon },
  { label: "Sellers", href: "/admin/sellers", permission: "sellers:read", icon: HandbagIcon },
  { label: "Vouchers", href: "/admin/vouchers", permission: "vouchers:read", icon: TicketIcon },
  { label: "Homepage", href: "/admin/content", permission: "content:read", icon: ImageIcon },
  { label: "Reports", href: "/admin/reports", permission: "reports:read", icon: ChartBarIcon },
  { label: "Audit logs", href: "/admin/audit-logs", permission: "audit:read", icon: ShieldCheckIcon },
];

export function AdminShell({ children, user, notifications, logoutAction }: { children: ReactNode; user: { name: string | null; email: string; role: UserRole }; notifications: { pendingOrders: number; lowStock: number }; logoutAction: () => Promise<void> }) {
  const pathname = usePathname(); const router = useRouter(); const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false);
  const items = navigation.filter((item) => hasAdminPermission(user.role, item.permission));
  function search(formData: FormData) { const query = String(formData.get("q") ?? "").trim(); if (query) router.push(`/admin/search?q=${encodeURIComponent(query)}`); }
  return <div className="min-h-dvh bg-[#f4f1eb] text-[#24231f]">
    <m.aside animate={{ width: collapsed ? 82 : 252 }} transition={{ duration: 0.22 }} className="fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-white/10 bg-[#24231f] text-[#f7f3eb] lg:flex lg:flex-col">
      <div className="flex h-20 items-center justify-between px-6"><Link href="/admin" aria-label="Admin dashboard"><Logo compact={collapsed} /></Link><button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"} className="grid size-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"><CaretDoubleLeftIcon className={cn("transition-transform", collapsed && "rotate-180")} aria-hidden /></button></div>
      <AdminNavigation items={items} pathname={pathname} collapsed={collapsed} />
      <Link href="/" className="m-4 mt-auto flex items-center gap-3 rounded-md border border-white/10 px-4 py-3 text-xs tracking-wider uppercase hover:bg-white/10"><StorefrontIcon className="size-5 shrink-0" aria-hidden />{!collapsed && "View storefront"}</Link>
    </m.aside>
    <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[82px]" : "lg:pl-[252px]")}> 
      <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-[#ded9cf] bg-[#faf8f3]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger asChild><Button size="icon" variant="ghost" className="lg:hidden" aria-label="Buka navigasi admin"><ListIcon className="size-5" aria-hidden /></Button></SheetTrigger><SheetContent side="left" className="w-[19rem] border-none bg-[#24231f] p-0 text-[#f7f3eb]"><SheetHeader className="flex-row items-center justify-between border-b border-white/10 p-5"><SheetTitle className="text-white"><Logo /></SheetTitle><button aria-label="Tutup navigasi" onClick={() => setMobileOpen(false)}><XIcon aria-hidden /></button></SheetHeader><AdminNavigation items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} /></SheetContent></Sheet>
        <form action={search} className="relative max-w-xl flex-1"><MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#77736b]" aria-hidden /><input name="q" aria-label="Global admin search" placeholder="Search products, orders, customers…" className="h-10 w-full rounded-md border border-[#ded9cf] bg-white pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-[#a28a5b]/30" /></form>
        <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="relative" aria-label="Notifications"><BellIcon className="size-5" aria-hidden />{notifications.pendingOrders + notifications.lowStock > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#9b654e]" />}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-72"><DropdownMenuLabel>Needs attention</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/admin/orders?status=PENDING_PAYMENT"><ReceiptIcon aria-hidden />{notifications.pendingOrders} pending orders</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/admin/products?stock=low"><WarehouseIcon aria-hidden />{notifications.lowStock} low-stock variants</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="gap-2 px-2 normal-case"><UserCircleIcon className="size-6" aria-hidden /><span className="hidden text-left sm:block"><span className="block max-w-32 truncate text-xs font-semibold">{user.name ?? user.email}</span><span className="block text-[0.625rem] text-muted-foreground">{user.role}</span></span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuLabel>{user.email}</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/account"><UserCircleIcon aria-hidden />Customer account</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/"><StorefrontIcon aria-hidden />Storefront</Link></DropdownMenuItem><DropdownMenuSeparator /><form action={logoutAction}><DropdownMenuItem asChild><button type="submit" className="w-full"><SignOutIcon aria-hidden />Logout</button></DropdownMenuItem></form></DropdownMenuContent></DropdownMenu>
      </header>
      <main id="main-content" className="min-h-[calc(100dvh-5rem)] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}

function AdminNavigation({ items, pathname, collapsed = false, onNavigate }: { items: NavItem[]; pathname: string; collapsed?: boolean; onNavigate?: () => void }) { return <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 py-4"><ul className="space-y-1">{items.map((item) => { const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href); const Icon = item.icon; return <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined} className={cn("flex h-11 items-center gap-3 rounded-md px-4 text-xs font-semibold tracking-wider uppercase transition-colors", active ? "bg-[#b6a06f] text-[#24231f]" : "text-white/65 hover:bg-white/8 hover:text-white", collapsed && "justify-center px-0")}><Icon className="size-5 shrink-0" weight={active ? "fill" : "regular"} aria-hidden />{!collapsed && item.label}</Link></li>; })}</ul></nav>; }
