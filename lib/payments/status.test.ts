import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { canTransitionPayment, createPaymentEvent, mapMidtransStatus, verifyMidtransSignature } from "./status";

describe("payment webhook", () => {
  it("menghasilkan event key sama untuk webhook duplikat", () => { const payload = { order_id: "IV-1", transaction_id: "trx-1", transaction_status: "settlement", status_code: "200", settlement_time: "2026-07-21" }; expect(createPaymentEvent(payload).eventKey).toBe(createPaymentEvent({ ...payload }).eventKey); });
  it("menolak signature webhook invalid", () => { expect(verifyMidtransSignature({ order_id: "IV-1", status_code: "200", gross_amount: "10000.00", signature_key: "invalid" }, "server-key")).toBe(false); });
  it("menerima signature Midtrans valid", () => { const key = "server-key"; const payload = { order_id: "IV-1", status_code: "200", gross_amount: "10000.00" }; const signature_key = createHash("sha512").update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${key}`).digest("hex"); expect(verifyMidtransSignature({ ...payload, signature_key }, key)).toBe(true); });
  it("memetakan dan membatasi transisi status", () => { expect(mapMidtransStatus("settlement")).toBe("PAID"); expect(mapMidtransStatus("expire")).toBe("EXPIRED"); expect(canTransitionPayment("PENDING", "PAID")).toBe(true); expect(canTransitionPayment("PAID", "FAILED")).toBe(false); });
});
