import { describe, expect, it } from "vitest";
import { canTransitionOrder } from "./status";

describe("order status", () => {
  it("mengizinkan alur fulfillment yang valid", () => { expect(canTransitionOrder("PAID", "PROCESSING")).toBe(true); expect(canTransitionOrder("PROCESSING", "SHIPPED")).toBe(true); });
  it("menolak lompatan status yang tidak valid", () => { expect(canTransitionOrder("PENDING_PAYMENT", "SHIPPED")).toBe(false); expect(canTransitionOrder("DELIVERED", "PROCESSING")).toBe(false); });
});
