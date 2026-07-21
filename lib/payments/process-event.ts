import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canTransitionPayment, type PaymentEvent, type ProviderPaymentStatus } from "@/lib/payments";
import { calculateCommission } from "@/lib/seller/domain";
import { logSellerActivity } from "@/lib/seller/activity";

export async function processPaymentEvent(event: PaymentEvent, provider: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { orderNumber: event.orderNumber }, include: { items: true, voucherUsages: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
      if (!order?.payments[0]) throw new Error("PAYMENT_NOT_FOUND");
      const payment = order.payments[0];
      if (payment.provider !== provider) throw new Error("PAYMENT_PROVIDER_MISMATCH");
      const grossAmount = event.raw.gross_amount;
      if (grossAmount != null && !new Prisma.Decimal(String(grossAmount)).equals(order.grandTotal)) throw new Error("PAYMENT_AMOUNT_MISMATCH");
      if (!canTransitionPayment(payment.status as ProviderPaymentStatus, event.status)) throw new Error("INVALID_PAYMENT_TRANSITION");
      await tx.paymentWebhookEvent.create({ data: { paymentId: payment.id, provider, eventKey: event.eventKey, payload: event.raw as Prisma.InputJsonValue } });
      const wasOpen = payment.status === "PENDING" || payment.status === "AUTHORIZED";
      if (wasOpen && event.status === "PAID") {
        for (const item of order.items) if (item.variantId) {
          const updated = await tx.inventory.updateMany({ where: { variantId: item.variantId, reserved: { gte: item.quantity }, quantity: { gte: item.quantity } }, data: { quantity: { decrement: item.quantity }, reserved: { decrement: item.quantity }, version: { increment: 1 } } });
          if (updated.count !== 1) throw new Error("INVENTORY_COMMIT_FAILED");
          const consignment = await tx.consignmentSubmission.findFirst({ where: { status: "LISTED", product: { variants: { some: { id: item.variantId } } } }, include: { seller: true, commission: true } });
          if (consignment) {
            const config = consignment.commission ?? await tx.commission.create({ data: { submissionId: consignment.id, rate: consignment.seller.commissionRate } });
            const money = calculateCommission({ grossAmount: item.lineTotal, rate: config.rate, fixedFee: config.fixedFee });
            const returnWindowEndsAt = new Date(); returnWindowEndsAt.setDate(returnWindowEndsAt.getDate() + 14);
            await tx.commission.update({ where: { id: config.id }, data: { orderItemId: item.id, ...money, calculatedAt: new Date() } });
            await tx.consignmentSubmission.update({ where: { id: consignment.id }, data: { status: "SOLD", soldAt: new Date(), returnWindowEndsAt, version: { increment: 1 } } });
            await logSellerActivity(tx, { sellerId: consignment.sellerId, action: "CONSIGNMENT_SOLD", entityType: "ConsignmentSubmission", entityId: consignment.id, moneyBefore: new Prisma.Decimal(0), moneyAfter: money.sellerNetAmount, metadata: { orderId: order.id, orderItemId: item.id, grossAmount: money.grossAmount, commissionAmount: money.commissionAmount, returnWindowEndsAt: returnWindowEndsAt.toISOString() } });
          }
        }
      }
      if (wasOpen && ["FAILED", "EXPIRED", "CANCELLED"].includes(event.status)) {
        for (const item of order.items) if (item.variantId) await tx.inventory.updateMany({ where: { variantId: item.variantId, reserved: { gte: item.quantity } }, data: { reserved: { decrement: item.quantity }, version: { increment: 1 } } });
        for (const usage of order.voucherUsages) {
          await tx.voucherUsage.delete({ where: { id: usage.id } });
          await tx.voucher.update({ where: { id: usage.voucherId }, data: { usedCount: { decrement: 1 } } });
        }
      }
      const orderStatus = event.status === "PAID" ? "PAID" : event.status === "REFUNDED" ? "REFUNDED" : ["FAILED", "EXPIRED", "CANCELLED"].includes(event.status) ? "CANCELLED" : order.status;
      await tx.payment.update({ where: { id: payment.id }, data: { status: event.status, providerRef: event.providerRef ?? payment.providerRef, paidAt: event.status === "PAID" ? new Date() : payment.paidAt, failureCode: ["FAILED", "EXPIRED", "CANCELLED"].includes(event.status) ? event.status : null, lastSyncedAt: new Date(), metadata: event.raw as Prisma.InputJsonValue } });
      await tx.order.update({ where: { id: order.id }, data: { status: orderStatus, paymentStatus: event.status, cancelledAt: orderStatus === "CANCELLED" ? new Date() : order.cancelledAt } });
      return { duplicate: false, orderId: order.id, status: event.status };
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { duplicate: true, status: event.status };
    throw error;
  }
}
