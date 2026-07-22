import { AccountHeading } from "@/components/account/account-heading";
import { LazyAccountList, type PaginationMeta, type WishlistEntry } from "@/components/account/lazy-account-list";
import { authenticatedBackendApi as backendApi } from "@/lib/authenticated-backend-api";
import { requireUser } from "@/lib/auth-guard";

export default async function AccountWishlistPage() {
  await requireUser();
  const response = await backendApi<WishlistEntry[] | { items?: WishlistEntry[] }>("/wishlist?limit=10", { cache: "no-store" });
  const items = Array.isArray(response.data) ? response.data : response.data.items ?? [];
  return <div><AccountHeading eyebrow="Saved pieces" title="Wishlist" description="Your saved pieces are synchronised with this account." /><LazyAccountList resource="wishlist" initialItems={items} initialMeta={response.meta as unknown as PaginationMeta | undefined} /></div>;
}
