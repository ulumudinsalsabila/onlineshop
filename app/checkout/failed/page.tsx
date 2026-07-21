import { OrderStatusPage } from "@/components/checkout/order-status-page";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <OrderStatusPage mode="failed" searchParams={searchParams} />; }
