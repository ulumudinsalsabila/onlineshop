export type ProviderPaymentStatus = "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type PaymentCustomer = { name: string; email: string; phone?: string | null };
export type PaymentItem = { id: string; name: string; price: number; quantity: number };
export type PaymentEvent = { eventKey: string; orderNumber: string; providerRef?: string; status: ProviderPaymentStatus; raw: Record<string, unknown> };
export type PaymentTransaction = { providerRef: string; redirectUrl: string; token?: string; expiresAt?: Date; raw?: Record<string, unknown> };

export interface PaymentProvider {
  readonly name: string;
  createTransaction(input: { orderNumber: string; amount: number; customer: PaymentCustomer; items: PaymentItem[]; finishUrl: string }): Promise<PaymentTransaction>;
  getStatus(orderNumber: string): Promise<PaymentEvent>;
  parseWebhook(payload: Record<string, unknown>): PaymentEvent;
  verifyWebhook(payload: Record<string, unknown>): boolean;
}
