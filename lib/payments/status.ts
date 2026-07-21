import { createHash, timingSafeEqual } from "node:crypto";

import type { PaymentEvent, ProviderPaymentStatus } from "./types";

export function mapMidtransStatus(status: string, fraudStatus?: string): ProviderPaymentStatus {
  if (status === "settlement") return "PAID";
  if (status === "capture") return fraudStatus === "accept" ? "PAID" : "AUTHORIZED";
  if (status === "deny" || status === "failure") return "FAILED";
  if (status === "expire") return "EXPIRED";
  if (status === "cancel") return "CANCELLED";
  if (status === "refund") return "REFUNDED";
  if (status === "partial_refund") return "PARTIALLY_REFUNDED";
  return "PENDING";
}

export function verifyMidtransSignature(payload: Record<string, unknown>, serverKey: string) {
  const orderId = String(payload.order_id ?? "");
  const statusCode = String(payload.status_code ?? "");
  const grossAmount = String(payload.gross_amount ?? "");
  const supplied = String(payload.signature_key ?? "").toLowerCase();
  if (!orderId || !statusCode || !grossAmount || !supplied) return false;
  const expected = createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
  const suppliedBuffer = Buffer.from(supplied, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function createPaymentEvent(payload: Record<string, unknown>): PaymentEvent {
  const orderNumber = String(payload.order_id ?? "");
  const status = mapMidtransStatus(String(payload.transaction_status ?? "pending"), String(payload.fraud_status ?? ""));
  const providerRef = payload.transaction_id ? String(payload.transaction_id) : undefined;
  const fingerprint = [orderNumber, providerRef, status, payload.settlement_time, payload.transaction_time, payload.status_code].join(":");
  return { eventKey: createHash("sha256").update(fingerprint).digest("hex"), orderNumber, providerRef, status, raw: payload };
}

const transitions: Record<ProviderPaymentStatus, ProviderPaymentStatus[]> = {
  PENDING: ["PENDING", "AUTHORIZED", "PAID", "FAILED", "EXPIRED", "CANCELLED"],
  AUTHORIZED: ["AUTHORIZED", "PAID", "FAILED", "EXPIRED", "CANCELLED"],
  PAID: ["PAID", "REFUNDED", "PARTIALLY_REFUNDED"],
  FAILED: ["FAILED"], EXPIRED: ["EXPIRED"], CANCELLED: ["CANCELLED"],
  REFUNDED: ["REFUNDED"], PARTIALLY_REFUNDED: ["PARTIALLY_REFUNDED", "REFUNDED"],
};

export function canTransitionPayment(current: ProviderPaymentStatus, next: ProviderPaymentStatus) { return transitions[current].includes(next); }
