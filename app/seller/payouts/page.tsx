import { SellerPageHeader } from "@/components/seller/seller-page-header";
import { Badge } from "@/components/ui/badge";
import { authenticatedBackendApi } from "@/lib/authenticated-backend-api";
import { formatIDR } from "@/lib/formatters";
import { requireSeller } from "@/lib/seller/auth";
import type { SellerPayout } from "@/types/seller-api";
export default async function PayoutsPage() {
  await requireSeller();
  const payouts = (
    await authenticatedBackendApi<SellerPayout[]>("/seller/payouts", {
      cache: "no-store",
    })
  ).data;
  return (
    <div>
      <SellerPageHeader title="Payout history" description="Payout history and transfer references." />
      <div className="border border-[#ddd5c7] bg-[#faf8f3]">
        {payouts.map((payout) => (
          <div key={payout.id} className="flex flex-wrap justify-between gap-4 border-b border-[#ddd5c7] p-5 last:border-0">
            <div>
              <p className="font-semibold">{payout.payoutNumber}</p>
              <p className="text-xs text-muted-foreground">
                {payout._count.items} sale ·{" "}
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                }).format(payout.requestedAt)}
              </p>
            </div>
            <div className="text-right">
              <p>{formatIDR(Number(payout.amount))}</p>
              <Badge variant="outline">{payout.status}</Badge>
              {payout.providerRef && <p className="mt-1 text-xs text-muted-foreground">{payout.providerRef}</p>}
            </div>
          </div>
        ))}
        {!payouts.length && <p className="p-10 text-center text-sm text-muted-foreground">No payouts yet.</p>}
      </div>
    </div>
  );
}
