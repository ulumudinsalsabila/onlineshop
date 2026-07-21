import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { findProductBySlug } from "@/lib/data/products";
import { normalizeSlug } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const product = await findProductBySlug(normalizeSlug((await params).slug));
    return product ? apiSuccess(product) : apiError("NOT_FOUND", "Produk tidak ditemukan.", 404);
  } catch (error) { return handleApiError(error); }
}
