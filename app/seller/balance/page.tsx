import { PayoutRequest } from "@/components/seller/payout-request";
import { SellerPageHeader } from "@/components/seller/seller-page-header";
import { authenticatedBackendApi } from "@/lib/authenticated-backend-api";
import { formatIDR } from "@/lib/formatters";
import { requireSeller } from "@/lib/seller/auth";
import type { SellerBalance } from "@/types/seller-api";
export default async function BalancePage() {
  await requireSeller();
  const data = (
    await authenticatedBackendApi<SellerBalance>("/seller/balance", {
      cache: "no-store",
    })
  ).data;
  return (
    <div>
      <SellerPageHeader title="Balance" description="Funds become eligible after the return period ends and there are no active returns." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card label="Available" value={formatIDR(data.available)} />
        <Card label="Processing" value={formatIDR(data.pending)} />
      </div>
      {data.eligible.length ? (
        <PayoutRequest
          items={data.eligible.map((item) => ({
            id: item.id,
            label: `${item.submission.title} · ${item.submission.submissionNumber}`,
            amount: Number(item.sellerNetAmount),
          }))}
        />
      ) : (
        <p className="border border-[#ddd5c7] bg-[#faf8f3] p-10 text-center text-sm text-muted-foreground">No balance is available for payout yet.</p>
      )}
    </div>
  );
}
function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#ddd5c7] bg-[#faf8f3] p-6">
      <p className="text-xs tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 font-serif text-4xl">{value}</p>
    </div>
  );
}
