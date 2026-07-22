import { AccountHeading } from "@/components/account/account-heading";
import { AddressManager, type Address } from "@/components/account/address-manager";
import { requireUser } from "@/lib/auth-guard";
import { authenticatedBackendApi as backendApi } from "@/lib/authenticated-backend-api";

export default async function AddressesPage() { await requireUser(); const addresses = (await backendApi<Address[]>("/addresses", { cache: "no-store" })).data; return <div><AccountHeading eyebrow="Delivery details" title="Addresses" description="Save an address to make your next checkout faster." /><AddressManager initialAddresses={addresses} /></div>; }
