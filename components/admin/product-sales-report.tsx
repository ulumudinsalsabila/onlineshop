"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { formatIDR } from "@/lib/formatters";

type Report = {
  summary: Record<string, number>;
  meta: { page: number; totalPages: number };
  items: Array<{
    key: string;
    productName: string;
    sku: string;
    unitsSold: number;
    orderCount: number;
    grossSales: number;
    discount: number;
    tax: number;
    refund: number;
    netSales: number;
  }>;
};
export function ProductSalesReport({ data }: { data: Report }) {
  const router = useRouter();
  const current = useSearchParams();
  const [busy, setBusy] = useState(false);
  function filter(form: FormData) {
    const query = new URLSearchParams();
    for (const key of ["from", "to", "q", "category", "brand", "sort"]) {
      const value = String(form.get(key) ?? "").trim();
      if (value) query.set(key, value);
    }
    router.push(`/admin/reports?${query}`);
  }
  async function download() {
    setBusy(true);
    try {
      const response = await apiFetch(`/admin/reports/products.csv?${current}`);
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "product-sales.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not export report");
    } finally {
      setBusy(false);
    }
  }
  function goToPage(page: number) {
    const query = new URLSearchParams(current);
    query.set("page", String(page));
    router.push(`/admin/reports?${query}`);
  }
  return (
    <div className="space-y-5">
      <form action={filter} className="grid gap-3 border p-4 md:grid-cols-3">
        <Input
          name="from"
          type="date"
          defaultValue={current.get("from") ?? ""}
        />
        <Input name="to" type="date" defaultValue={current.get("to") ?? ""} />
        <Input
          name="q"
          placeholder="Product or SKU"
          defaultValue={current.get("q") ?? ""}
        />
        <Input
          name="category"
          placeholder="Category ID"
          defaultValue={current.get("category") ?? ""}
        />
        <Input
          name="brand"
          placeholder="Brand ID"
          defaultValue={current.get("brand") ?? ""}
        />
        <select
          name="sort"
          defaultValue={current.get("sort") ?? "net-desc"}
          className="h-10 border bg-background px-3 text-sm"
        >
          <option value="net-desc">Net sales</option>
          <option value="units-desc">Units sold</option>
          <option value="name-asc">Product name</option>
        </select>
        <div className="flex gap-2">
          <Button type="submit">Apply</Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={download}
          >
            {busy ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </form>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Units sold"
          value={String(data.summary.unitsSold ?? 0)}
        />
        <Metric label="Orders" value={String(data.summary.orderCount ?? 0)} />
        <Metric
          label="Net sales"
          value={formatIDR(data.summary.netSales ?? 0)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              {[
                "Product",
                "SKU",
                "Units",
                "Orders",
                "Gross",
                "Discount",
                "Tax",
                "Refund",
                "Net",
              ].map((v) => (
                <th key={v} className="p-3">
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((row) => (
              <tr key={row.key} className="border-b">
                <td className="p-3">{row.productName}</td>
                <td className="p-3">{row.sku}</td>
                <td className="p-3">{row.unitsSold}</td>
                <td className="p-3">{row.orderCount}</td>
                {[
                  row.grossSales,
                  row.discount,
                  row.tax,
                  row.refund,
                  row.netSales,
                ].map((value, index) => (
                  <td key={index} className="p-3 tabular-nums">
                    {formatIDR(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-3 text-sm">
        <Button variant="outline" disabled={data.meta.page <= 1} onClick={() => goToPage(data.meta.page - 1)}>Previous</Button>
        <span>Page {data.meta.page} of {data.meta.totalPages}</span>
        <Button variant="outline" disabled={data.meta.page >= data.meta.totalPages} onClick={() => goToPage(data.meta.page + 1)}>Next</Button>
      </div>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border bg-secondary/20 p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
