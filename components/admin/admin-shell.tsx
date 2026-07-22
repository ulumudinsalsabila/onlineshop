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
import { apiFetch, clearApiAccessToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavItem = { label: string; href: string; permission: AdminPermission; icon: typeof HouseIcon; group: "Overview" | "Commerce" | "Operations" | "System" };
const navigation: NavItem[] = [
  { label: "Dashboard", href: "/admin", permission: "dashboard:read", icon: HouseIcon, group: "Overview" },
  { label: "Products", href: "/admin/products", permission: "products:read", icon: PackageIcon, group: "Commerce" },
  { label: "Categories", href: "/admin/categories", permission: "categories:read", icon: ListIcon, group: "Commerce" },
  { label: "Brands", href: "/admin/brands", permission: "brands:read", icon: TagIcon, group: "Commerce" },
  { label: "Inventory", href: "/admin/inventory", permission: "products:read", icon: WarehouseIcon, group: "Commerce" },
  { label: "Orders", href: "/admin/orders", permission: "orders:read", icon: ReceiptIcon, group: "Operations" },
  { label: "Shipments", href: "/admin/shipments", permission: "orders:read", icon: StorefrontIcon, group: "Operations" },
  { label: "Customers", href: "/admin/customers", permission: "customers:read", icon: UsersIcon, group: "Operations" },
  { label: "Sellers", href: "/admin/sellers", permission: "sellers:read", icon: HandbagIcon, group: "Operations" },
  { label: "Vouchers", href: "/admin/vouchers", permission: "vouchers:read", icon: TicketIcon, group: "Operations" },
  { label: "Homepage", href: "/admin/content", permission: "content:read", icon: ImageIcon, group: "System" },
  { label: "Testimonials", href: "/admin/testimonials", permission: "content:read", icon: UserCircleIcon, group: "System" },
  { label: "Reports", href: "/admin/reports", permission: "reports:read", icon: ChartBarIcon, group: "System" },
  { label: "Audit logs", href: "/admin/audit-logs", permission: "audit:read", icon: ShieldCheckIcon, group: "System" },
];

export function AdminShell({ children, user, notifications }: { children: ReactNode; user: { name: string | null; email: string; role: UserRole }; notifications: { pendingOrders: number; lowStock: number } }) {
  const pathname = usePathname(); const router = useRouter(); const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false);
  const items = navigation.filter((item) => hasAdminPermission(user.role, item.permission));
  function search(formData: FormData) { const query = String(formData.get("q") ?? "").trim(); if (query) router.push(`/admin/search?q=${encodeURIComponent(query)}`); }
  async function logout() { try { await apiFetch("/auth/logout", { method: "POST" }); } finally { clearApiAccessToken(); router.replace("/login"); router.refresh(); } }
  return <div className="min-h-dvh bg-[#f6f4ef] text-[#292722]">
    <m.aside animate={{ width: collapsed ? 74 : 248 }} transition={{ duration: 0.2 }} className="fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-[#ddd7cc] bg-[#fbfaf7] text-[#39352f] lg:flex lg:flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[#e5e0d7] px-5"><Link href="/admin" aria-label="Admin dashboard"><Logo compact={collapsed} /></Link><button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"} className="grid size-8 place-items-center rounded-md text-[#827b70] hover:bg-[#eee9df] hover:text-[#292722]"><CaretDoubleLeftIcon className={cn("transition-transform", collapsed && "rotate-180")} aria-hidden /></button></div>
      <AdminNavigation items={items} pathname={pathname} collapsed={collapsed} />
      <Link href="/" className="m-3 mt-auto flex h-10 items-center gap-3 rounded-md border border-[#ddd7cc] px-3 text-xs font-medium hover:bg-[#eee9df]"><StorefrontIcon className="size-4 shrink-0" aria-hidden />{!collapsed && "View storefront"}</Link>
    </m.aside>
    <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[74px]" : "lg:pl-[248px]")}> 
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#ddd7cc] bg-[#fbfaf7]/95 px-4 backdrop-blur sm:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger asChild><Button size="icon" variant="ghost" className="lg:hidden" aria-label="Buka navigasi admin"><ListIcon className="size-5" aria-hidden /></Button></SheetTrigger><SheetContent side="left" className="w-[19rem] border-r border-[#ddd7cc] bg-[#fbfaf7] p-0 text-[#39352f]"><SheetHeader className="flex-row items-center justify-between border-b border-[#e5e0d7] p-5"><SheetTitle><Logo /></SheetTitle><button aria-label="Tutup navigasi" onClick={() => setMobileOpen(false)}><XIcon aria-hidden /></button></SheetHeader><AdminNavigation items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} /></SheetContent></Sheet>
        <form action={search} className="relative max-w-xl flex-1"><MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#77736b]" aria-hidden /><input name="q" aria-label="Global admin search" placeholder="Search products, orders, customers…" className="h-10 w-full rounded-md border border-[#ded9cf] bg-white pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-[#a28a5b]/30" /></form>
        <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="relative" aria-label="Notifications"><BellIcon className="size-5" aria-hidden />{notifications.pendingOrders + notifications.lowStock > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#9b654e]" />}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-72"><DropdownMenuLabel>Needs attention</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/admin/orders?status=PENDING_PAYMENT"><ReceiptIcon aria-hidden />{notifications.pendingOrders} pending orders</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/admin/products?stock=low"><WarehouseIcon aria-hidden />{notifications.lowStock} low-stock variants</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="gap-2 px-2 normal-case"><UserCircleIcon className="size-6" aria-hidden /><span className="hidden text-left sm:block"><span className="block max-w-32 truncate text-xs font-semibold">{user.name ?? user.email}</span><span className="block text-[0.625rem] text-muted-foreground">{user.role}</span></span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuLabel>{user.email}</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/admin"><HouseIcon aria-hidden />Admin dashboard</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/"><StorefrontIcon aria-hidden />Storefront</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void logout()}><SignOutIcon aria-hidden />Logout</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </header>
      <main id="main-content" className="min-h-[calc(100dvh-4rem)] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}

function AdminNavigation({ items, pathname, collapsed = false, onNavigate }: { items: NavItem[]; pathname: string; collapsed?: boolean; onNavigate?: () => void }) { const groups = ["Overview", "Commerce", "Operations", "System"] as const; return <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 py-4">{groups.map((group) => { const groupItems = items.filter((item) => item.group === group); if (!groupItems.length) return null; return <div key={group} className="mb-5">{!collapsed && <p className="mb-2 px-3 text-[0.625rem] font-semibold tracking-[0.12em] text-[#999185] uppercase">{group}</p>}<ul className="space-y-1">{groupItems.map((item) => { const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href); const Icon = item.icon; return <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined} className={cn("flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-[#e9e2d5] text-[#5f5036]" : "text-[#6f695f] hover:bg-[#f0ece4] hover:text-[#292722]", collapsed && "justify-center px-0")}><Icon className="size-4 shrink-0" weight={active ? "fill" : "regular"} aria-hidden />{!collapsed && item.label}</Link></li>; })}</ul></div>; })}</nav>; }
