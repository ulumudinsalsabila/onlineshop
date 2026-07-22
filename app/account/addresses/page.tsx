import { AccountHeading } from "@/components/account/account-heading";
import { AddressManager, type Address } from "@/components/account/address-manager";
import type { PaginationMeta } from "@/components/account/lazy-account-list";
import { requireUser } from "@/lib/auth-guard";
import { authenticatedBackendApi as backendApi } from "@/lib/authenticated-backend-api";

export default async function AddressesPage() { await requireUser(); const response = await backendApi<Address[]>("/addresses?limit=10", { cache: "no-store" }); return <div><AccountHeading eyebrow="Delivery details" title="Addresses" description="Save an address to make your next checkout faster." /><AddressManager initialAddresses={response.data} initialMeta={response.meta as unknown as PaginationMeta | undefined} /></div>; }
