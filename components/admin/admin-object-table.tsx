import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIDR } from "@/lib/formatters";
import { AdminPagination, type PaginationInfo } from "@/components/admin/admin-pagination";

type Row = Record<string, unknown>;
const preferred = ["name", "displayName", "orderNumber", "submissionNumber", "payoutNumber", "productName", "title", "code", "baseSku", "sku", "customerName", "email", "role", "status", "paymentStatus", "quantity", "reserved", "usedCount", "value", "grandTotal", "amount", "createdAt", "updatedAt"];
const moneyKeys = new Set(["price", "value", "grandTotal", "amount", "revenue", "lineTotal", "shippingCost"]);

export function AdminObjectTable({ items, basePath, renderAction, columns, pagination, pageParam }: { items: Row[]; basePath?: string; renderAction?: (item: Row) => React.ReactNode; columns?: string[]; pagination?: PaginationInfo; pageParam?: string }) {
  const shown = columns?.length ? columns : inferColumns(items);
  return <div className="overflow-hidden rounded-lg border border-[#ded8cd] bg-white"><div className="overflow-x-auto"><Table><TableHeader><TableRow>{shown.map((key) => <TableHead key={key} className="h-10 whitespace-nowrap bg-[#f3efe7] text-[0.6875rem] font-semibold tracking-[0.08em] text-[#6f695f] uppercase">{label(key)}</TableHead>)}{(basePath || renderAction) && <TableHead className="w-24 bg-[#f3efe7] text-right">Action</TableHead>}</TableRow></TableHeader><TableBody>{items.length ? items.map((item, index) => <TableRow key={String(item.id ?? index)} className="hover:bg-[#faf8f3]">{shown.map((key) => <TableCell key={key} className="max-w-72 align-top text-sm">{formatCell(key, item[key])}</TableCell>)}{(basePath || renderAction) && <TableCell className="text-right">{renderAction?.(item)}{basePath && item.id ? <Link href={`${basePath}/${item.id}`} className="ml-2 inline-flex h-8 items-center rounded-md border border-[#d8d1c5] px-3 text-xs font-semibold text-[#554a39] hover:bg-[#eee8dc]">Manage</Link> : null}</TableCell>}</TableRow>) : <TableRow><TableCell colSpan={shown.length + (basePath || renderAction ? 1 : 0)} className="h-32 text-center text-sm text-muted-foreground">No data available.</TableCell></TableRow>}</TableBody></Table></div>{pagination ? <AdminPagination pagination={pagination} param={pageParam} /> : null}</div>;
}

function inferColumns(items: Row[]) { const keys = new Set(items.flatMap((item) => Object.keys(item).filter((key) => key !== "id" && !Array.isArray(item[key])))); const ordered = preferred.filter((key) => keys.has(key)); for (const key of keys) if (!ordered.includes(key) && !key.endsWith("Id") && !["metadata", "deletedAt", "passwordHash"].includes(key)) ordered.push(key); return ordered.slice(0, 7); }
function label(value: string) { return value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " "); }
function formatCell(key: string, value: unknown): React.ReactNode {
  if (value == null || value === "") return <span className="text-muted-foreground">—</span>;
  if (typeof value === "boolean") return <Badge variant="outline" className={value ? "border-emerald-700/20 bg-emerald-50 text-emerald-800" : "bg-[#f3efe7] text-[#766f64]"}>{value ? "Yes" : "No"}</Badge>;
  if (key.toLowerCase().includes("status") || key === "role") return <Badge variant="outline" className="border-[#cfc4b1] bg-[#f5f0e6] text-[#66583f]">{String(value).replaceAll("_", " ")}</Badge>;
  if (moneyKeys.has(key) && !Number.isNaN(Number(value))) return <span className="font-medium tabular-nums">{formatIDR(Number(value))}</span>;
  if (value instanceof Date || typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  if (typeof value === "object") { const object = value as Row; const primary = object.name ?? object.displayName ?? object.orderNumber ?? object.productName ?? object.title ?? object.email ?? object.sku; if (primary) return String(primary); const pairs = Object.entries(object).filter(([, item]) => ["string", "number"].includes(typeof item)).slice(0, 2); return pairs.map(([name, item]) => `${label(name)}: ${String(item)}`).join(" · ") || "—"; }
  return <span className="line-clamp-2">{String(value)}</span>;
}
