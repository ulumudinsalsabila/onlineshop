import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { checkoutSchema } from "@/lib/checkout/schemas";
import { createOrderFromActiveCart, getCheckoutContext } from "@/lib/orders/create-order";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    return apiSuccess(await getCheckoutContext(authResult.user.id));
  } catch (error) { return checkoutError(error); }
}

export async function POST(request: Request) {
  try {
    const limit = rateLimit(requestFingerprint(request, "checkout"), 8, 60_000);
    if (!limit.allowed) return apiError("RATE_LIMITED", "Terlalu banyak percobaan checkout. Tunggu sebentar.", 429);
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const data = checkoutSchema.parse(await request.json());
    return apiSuccess(await createOrderFromActiveCart({ ...data, userId: authResult.user.id }), { status: 201 });
  } catch (error) { return checkoutError(error); }
}

function checkoutError(error: unknown) {
  if (error instanceof Error) {
    const known: Record<string, [string, number]> = { EMPTY_CART: ["Keranjang Anda kosong.", 409], INSUFFICIENT_STOCK: ["Stok salah satu produk tidak lagi mencukupi.", 409], ADDRESS_NOT_FOUND: ["Alamat tidak ditemukan.", 404], SHIPPING_OPTION_INVALID: ["Layanan pengiriman tidak lagi tersedia.", 409], VOUCHER_INVALID: ["Voucher tidak valid atau sudah berakhir.", 422], VOUCHER_LIMIT_REACHED: ["Batas penggunaan voucher telah tercapai.", 422], VOUCHER_MIN_SPEND: ["Belanja belum memenuhi minimum voucher.", 422] };
    if (known[error.message]) return apiError(error.message, known[error.message][0], known[error.message][1]);
  }
  return handleApiError(error);
}
