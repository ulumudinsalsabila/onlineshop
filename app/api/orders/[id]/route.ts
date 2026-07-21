import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const order = await prisma.order.findFirst({ where: { id: (await params).id, userId: authResult.user.id }, include: { items: true, payments: { select: { id: true, method: true, status: true, amount: true, paidAt: true } }, shipments: true, returnRequests: true } });
    if (!order) return apiError("NOT_FOUND", "Pesanan tidak ditemukan.", 404);
    return apiSuccess({ ...order, subtotal: Number(order.subtotal), discountTotal: Number(order.discountTotal), shippingTotal: Number(order.shippingTotal), taxTotal: Number(order.taxTotal), grandTotal: Number(order.grandTotal), items: order.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice), compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null, lineTotal: Number(item.lineTotal) })), payments: order.payments.map((payment) => ({ ...payment, amount: Number(payment.amount) })), shipments: order.shipments.map((shipment) => ({ ...shipment, shippingCost: Number(shipment.shippingCost) })) });
  } catch (error) { return handleApiError(error); }
}
