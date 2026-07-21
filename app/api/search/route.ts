import { apiSuccess, handleApiError } from "@/lib/api-response";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { listProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const query = parseCatalogQuery({ q: params.get("q") ?? "", page: params.get("page") ?? "1", sort: params.get("sort") ?? "best-selling" });
    const result = await listProducts(query);
    return apiSuccess({ suggestions: result.items.slice(0, 6), query: query.q }, undefined, { total: result.total, page: result.page, totalPages: result.totalPages });
  } catch (error) { return handleApiError(error); }
}
