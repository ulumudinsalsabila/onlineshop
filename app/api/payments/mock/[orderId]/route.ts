import { createHash } from "node:crypto";
import { z } from "zod";

import { authenticateApi } from "@/lib/api-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { MockPaymentProvider } from "@/lib/payments/mock";
import { processPaymentEvent } from "@/lib/payments/process-event";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    if (process.env.NODE_ENV === "production") return apiError("NOT_FOUND", "Endpoint tidak tersedia.", 404);
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const order = await prisma.order.findFirst({ where: { id: (await params).orderId, userId: authResult.user.id }, include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
    if (!order || order.payments[0]?.provider !== "mock") return apiError("NOT_FOUND", "Pembayaran mock tidak ditemukan.", 404);
    const { status } = z.object({ status: z.enum(["settlement", "failure", "expire", "cancel"]) }).parse(await request.json());
    const secret = process.env.MOCK_PAYMENT_SECRET ?? "local-development-only";
    const payload = { order_id: order.orderNumber, transaction_id: order.payments[0].providerRef ?? `mock-${order.orderNumber}`, transaction_status: status, status_code: "200", gross_amount: order.grandTotal.toFixed(2), transaction_time: new Date().toISOString() };
    const signed = { ...payload, signature_key: createHash("sha256").update(`${payload.order_id}:${payload.transaction_status}:${secret}`).digest("hex") };
    const provider = new MockPaymentProvider();
    if (!provider.verifyWebhook(signed)) return apiError("INVALID_SIGNATURE", "Signature tidak valid.", 401);
    return apiSuccess(await processPaymentEvent(provider.parseWebhook(signed), provider.name));
  } catch (error) { return handleApiError(error); }
}
