import { createHash, randomUUID } from "node:crypto";

import { createPaymentEvent } from "./status";
import type { PaymentProvider } from "./types";

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";
  async createTransaction(input: { orderNumber: string; finishUrl: string }) {
    return { providerRef: `mock-${randomUUID()}`, redirectUrl: `${input.finishUrl}?order=${encodeURIComponent(input.orderNumber)}&mock=1`, token: undefined, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), raw: { mode: "mock" } };
  }
  async getStatus(orderNumber: string) { return createPaymentEvent({ order_id: orderNumber, transaction_id: `mock-${orderNumber}`, transaction_status: "pending", status_code: "201", transaction_time: "mock" }); }
  parseWebhook(payload: Record<string, unknown>) { return createPaymentEvent(payload); }
  verifyWebhook(payload: Record<string, unknown>) {
    const secret = process.env.MOCK_PAYMENT_SECRET ?? "local-development-only";
    const expected = createHash("sha256").update(`${payload.order_id}:${payload.transaction_status}:${secret}`).digest("hex");
    return payload.signature_key === expected;
  }
}
