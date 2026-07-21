import { AccountHeading } from "@/components/account/account-heading";
import { AddressManager } from "@/components/account/address-manager";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage() { const user = await requireUser(); const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }); return <div><AccountHeading eyebrow="Delivery details" title="Addresses" description="Save an address to make your next checkout faster." /><AddressManager initialAddresses={addresses} /></div>; }
