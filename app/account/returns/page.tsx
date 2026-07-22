import { AccountHeading } from "@/components/account/account-heading";
import { authenticatedBackendApi as backendApi } from "@/lib/authenticated-backend-api";
import { requireUser } from "@/lib/auth-guard";

type ReturnItem = { id: string; returnNumber: string; reason: string; status: string; order: { orderNumber: string }; orderItem: { productName: string } | null };

export default async function ReturnsPage() {
  await requireUser();
  const returns = (await backendApi<ReturnItem[]>("/returns", { cache: "no-store" })).data;
  return <div><AccountHeading eyebrow="Aftercare" title="Returns" description="Follow your return requests and our inspection results." /><div className="mt-8 divide-y divide-border border-y border-border">{returns.length ? returns.map((item) => <article key={item.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]"><div><p className="text-xs font-semibold tracking-wider uppercase">{item.returnNumber} · {item.order.orderNumber}</p><p className="mt-2 font-serif text-xl">{item.orderItem?.productName ?? "Order return"}</p><p className="mt-1 text-sm text-muted-foreground">{item.reason}</p></div><p className="text-xs tracking-wider uppercase">{item.status}</p></article>) : <p className="py-16 text-center text-sm text-muted-foreground">There are no return requests yet.</p>}</div></div>;
}
