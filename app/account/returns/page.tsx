import { AccountHeading } from "@/components/account/account-heading";
import { LazyAccountList, type AccountReturn, type PaginationMeta } from "@/components/account/lazy-account-list";
import { authenticatedBackendApi as backendApi } from "@/lib/authenticated-backend-api";
import { requireUser } from "@/lib/auth-guard";

export default async function ReturnsPage() {
  await requireUser();
  const response = await backendApi<AccountReturn[]>("/returns?limit=10", { cache: "no-store" });
  return <div><AccountHeading eyebrow="Aftercare" title="Returns" description="Follow your return requests and our inspection results." /><LazyAccountList resource="returns" initialItems={response.data} initialMeta={response.meta as unknown as PaginationMeta | undefined} /></div>;
}
