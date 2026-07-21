import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { env } from "@/lib/env";
import { MidtransProvider } from "@/lib/payments/midtrans";
import { processPaymentEvent } from "@/lib/payments/process-event";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(requestFingerprint(request, "midtrans-webhook"), 120, 60_000);
    if (!limit.allowed) return apiError("RATE_LIMITED", "Webhook rate limit exceeded.", 429);
    if (!env.MIDTRANS_SERVER_KEY) return apiError("PROVIDER_DISABLED", "Midtrans belum dikonfigurasi.", 503);
    const payload = await request.json() as Record<string, unknown>;
    const provider = new MidtransProvider(env.MIDTRANS_SERVER_KEY);
    if (!provider.verifyWebhook(payload)) return apiError("INVALID_SIGNATURE", "Signature webhook tidak valid.", 401);
    return apiSuccess(await processPaymentEvent(provider.parseWebhook(payload), provider.name));
  } catch (error) { return handleApiError(error); }
}
