import { authenticateApi } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { checkoutSchema } from "@/lib/checkout/schemas";
import { previewCheckout } from "@/lib/orders/create-order";

export async function POST(request: Request) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const data = checkoutSchema.parse(await request.json());
    return apiSuccess(await previewCheckout({ ...data, userId: authResult.user.id }));
  } catch (error) { return handleApiError(error); }
}
