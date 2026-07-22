import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { authenticatedBackendApi } from "@/lib/authenticated-backend-api";
import { requireAdmin } from "@/lib/admin/auth";

type Search = Promise<Record<string, string | string[] | undefined>>;
type ApiValue = null | string | number | boolean | Date | ApiValue[] | { [key: string]: ApiValue };
type ApiObject = { [key: string]: ApiValue };
const viewNames: Record<string, string> = { "": "dashboard", products: "products", "products/new": "products", orders: "orders", customers: "customers", categories: "categories", brands: "brands", vouchers: "vouchers", content: "content", "audit-logs": "audit", reports: "reports", search: "search", sellers: "sellers", "sellers/activity": "seller-activity", "sellers/payouts": "payouts", "sellers/submissions": "submissions" };

export default async function RemoteAdminPage({ params, searchParams }: { params: Promise<{ segments?: string[] }>; searchParams: Search }) {
  await requireAdmin();
  const segments = (await params).segments ?? []; const path = segments.join("/"); const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) if (typeof value === "string") query.set(key, value);
  const detail = detailEndpoint(segments); const view = viewNames[path]; if (!detail && !view) notFound();
  const endpoint = detail ?? `/admin/views/${view}${query.size ? `?${query}` : ""}`;
  const data = (await authenticatedBackendApi<ApiValue>(endpoint, { cache: "no-store" })).data;
  const title = path ? path.split("/").map(titleCase).join(" · ") : "Commerce overview";
  return <div><AdminPageHeader title={title} description="Data ditampilkan langsung dari API backend." />{path === "products/new" ? <p className="border border-[#ded9cf] bg-[#faf8f3] p-6 text-sm">Pembuatan produk dilakukan melalui endpoint admin backend. Form editor akan menggunakan kontrak API produk tanpa akses database frontend.</p> : <ApiData value={data} />}</div>;
}

function detailEndpoint(segments: string[]) { if (segments[0] === "products" && segments[1] && segments[1] !== "new") return `/admin/details/products/${encodeURIComponent(segments[1])}`; if (segments[0] === "orders" && segments[1]) return `/admin/details/orders/${encodeURIComponent(segments[1])}`; if (segments[0] === "customers" && segments[1]) return `/admin/details/customers/${encodeURIComponent(segments[1])}`; if (segments[0] === "sellers" && segments[1] === "submissions" && segments[2]) return `/admin/details/submissions/${encodeURIComponent(segments[2])}`; if (segments[0] === "sellers" && segments[1] && !["activity", "payouts", "submissions"].includes(segments[1])) return `/admin/details/sellers/${encodeURIComponent(segments[1])}`; return null; }
function titleCase(value: string) { return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function ApiData({ value }: { value: ApiValue }) { if (value == null) return <p className="border border-[#ded9cf] p-8 text-sm text-muted-foreground">Data tidak ditemukan.</p>; if (Array.isArray(value)) return <div className="grid gap-4">{value.map((item, index) => <ApiData key={isObject(item) && typeof item.id === "string" ? item.id : index} value={item} />)}</div>; if (!isObject(value)) return <span>{formatValue(value)}</span>; const primary = Array.isArray(value.items) ? value.items : null; return <div className="space-y-5">{primary ? <ApiData value={primary} /> : <article className="border border-[#ded9cf] bg-[#faf8f3] p-5"><dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(value).filter(([, item]) => !isObject(item) && !Array.isArray(item)).map(([key, item]) => <div key={key}><dt className="text-[0.625rem] font-semibold tracking-wider text-muted-foreground uppercase">{titleCase(key)}</dt><dd className="mt-1 break-words text-sm">{formatValue(item)}</dd></div>)}</dl>{typeof value.id === "string" ? <Link className="mt-4 inline-block text-xs font-semibold underline" href={`#${value.id}`}>#{value.id.slice(-8)}</Link> : null}</article>}{Object.entries(value).filter(([key, item]) => key !== "items" && (isObject(item) || Array.isArray(item))).map(([key, item]) => <section key={key}><h2 className="mb-3 font-serif text-2xl">{titleCase(key)}</h2><ApiData value={item} /></section>)}</div>; }
function isObject(value: ApiValue): value is ApiObject { return Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date); }
function formatValue(value: ApiValue) { if (value == null) return "—"; if (value instanceof Date) return value.toLocaleString("id-ID"); if (typeof value === "boolean") return value ? "Yes" : "No"; return String(value); }
