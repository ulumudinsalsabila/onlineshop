import { authenticateApi } from "@/lib/api-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { getPaymentProvider } from "@/lib/payments";
import { processPaymentEvent } from "@/lib/payments/process-event";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const order = await prisma.order.findFirst({ where: { id: (await params).orderId, userId: authResult.user.id }, select: { orderNumber: true } });
    if (!order) return apiError("NOT_FOUND", "Pesanan tidak ditemukan.", 404);
    const provider = getPaymentProvider();
    const event = await provider.getStatus(order.orderNumber);
    return apiSuccess(await processPaymentEvent(event, provider.name));
  } catch (error) { return handleApiError(error); }
}
