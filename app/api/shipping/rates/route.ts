import { authenticateApi } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { ratesSchema } from "@/lib/checkout/schemas";
import { quoteShipping } from "@/lib/orders/create-order";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(requestFingerprint(request, "shipping-rates"), 30, 60_000);
    if (!limit.allowed) return new Response(JSON.stringify({ success: false, error: { code: "RATE_LIMITED", message: "Terlalu banyak permintaan ongkir." } }), { status: 429, headers: { "Content-Type": "application/json" } });
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const data = ratesSchema.parse(await request.json());
    return apiSuccess(await quoteShipping(authResult.user.id, data.postalCode, data.courierCodes));
  } catch (error) { return handleApiError(error); }
}
