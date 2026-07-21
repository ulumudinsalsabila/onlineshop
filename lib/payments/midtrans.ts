import { env } from "@/lib/env";
import { createPaymentEvent, verifyMidtransSignature } from "./status";
import type { PaymentProvider } from "./types";

export class MidtransProvider implements PaymentProvider {
  readonly name = "midtrans";
  constructor(private readonly serverKey: string) {}
  private get coreBase() { return env.MIDTRANS_IS_PRODUCTION ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com"; }
  private get snapBase() { return env.MIDTRANS_IS_PRODUCTION ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com"; }
  private get authorization() { return `Basic ${Buffer.from(`${this.serverKey}:`).toString("base64")}`; }

  async createTransaction(input: { orderNumber: string; amount: number; customer: { name: string; email: string; phone?: string | null }; items: { id: string; name: string; price: number; quantity: number }[]; finishUrl: string }) {
    const response = await fetch(`${this.snapBase}/snap/v1/transactions`, { method: "POST", headers: { Authorization: this.authorization, Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ transaction_details: { order_id: input.orderNumber, gross_amount: input.amount }, customer_details: { first_name: input.customer.name, email: input.customer.email, phone: input.customer.phone }, item_details: input.items, callbacks: { finish: input.finishUrl }, expiry: { unit: "hours", duration: 24 } }), cache: "no-store" });
    const payload = await response.json() as { token?: string; redirect_url?: string; error_messages?: string[] };
    if (!response.ok || !payload.redirect_url) throw new Error(payload.error_messages?.join(", ") ?? `MIDTRANS_CREATE_${response.status}`);
    return { providerRef: input.orderNumber, redirectUrl: payload.redirect_url, token: payload.token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), raw: payload };
  }
  async getStatus(orderNumber: string) {
    const response = await fetch(`${this.coreBase}/v2/${encodeURIComponent(orderNumber)}/status`, { headers: { Authorization: this.authorization, Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`MIDTRANS_STATUS_${response.status}`);
    return createPaymentEvent(await response.json() as Record<string, unknown>);
  }
  parseWebhook(payload: Record<string, unknown>) { return createPaymentEvent(payload); }
  verifyWebhook(payload: Record<string, unknown>) { return verifyMidtransSignature(payload, this.serverKey); }
}
