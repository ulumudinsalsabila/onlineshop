import { AccountHeading } from "@/components/account/account-heading";
import { LazyAccountList, type AccountOrder, type PaginationMeta } from "@/components/account/lazy-account-list";
import { authenticatedBackendApi as backendApi } from "@/lib/authenticated-backend-api";
import { requireUser } from "@/lib/auth-guard";

export default async function OrdersPage() {
  await requireUser();
  const response = await backendApi<AccountOrder[]>("/orders?limit=10", { cache: "no-store" });
  return <div><AccountHeading eyebrow="Purchase history" title="Orders" description="Status and details for all your orders." /><LazyAccountList resource="orders" initialItems={response.data} initialMeta={response.meta as unknown as PaginationMeta | undefined} /></div>;
}
