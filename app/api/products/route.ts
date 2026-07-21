import { apiSuccess, handleApiError } from "@/lib/api-response";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { listProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const raw = Object.fromEntries(new URL(request.url).searchParams.entries());
    const query = parseCatalogQuery(raw);
    const result = await listProducts(query);
    return apiSuccess(result.items, undefined, { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages });
  } catch (error) { return handleApiError(error); }
}
