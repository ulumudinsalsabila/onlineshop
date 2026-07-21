import Link from "next/link";
import { ArrowRightIcon, HeartIcon, MapPinIcon, PackageIcon } from "@phosphor-icons/react/dist/ssr";

import { AccountHeading } from "@/components/account/account-heading";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const user = await requireUser();
  const [orders, addresses, wishlist] = await prisma.$transaction([prisma.order.count({ where: { userId: user.id } }), prisma.address.count({ where: { userId: user.id } }), prisma.wishlistItem.count({ where: { wishlist: { userId: user.id } } })]);
  const cards = [{ label: "Orders", value: orders, href: "/account/orders", icon: PackageIcon }, { label: "Saved addresses", value: addresses, href: "/account/addresses", icon: MapPinIcon }, { label: "Wishlist", value: wishlist, href: "/account/wishlist", icon: HeartIcon }];
  return <div><AccountHeading eyebrow="Private client area" title={`Welcome, ${user.name?.split(" ")[0] ?? "Client"}.`} description="Manage your saved pieces, delivery details, and every stage of your orders." /><div className="mt-8 grid gap-4 sm:grid-cols-3">{cards.map((card) => <Link key={card.href} href={card.href} className="group border border-border bg-background p-6 transition-colors hover:bg-secondary/50"><card.icon size={24} weight="light" aria-hidden /><p className="mt-8 font-serif text-4xl">{card.value}</p><span className="mt-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">{card.label}<ArrowRightIcon className="transition-transform group-hover:translate-x-1" aria-hidden /></span></Link>)}</div></div>;
}
