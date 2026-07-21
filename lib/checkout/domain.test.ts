import { describe, expect, it } from "vitest";
import { calculateCheckoutTotals, createOrderLines, type CheckoutLine } from "./domain";

const lines: CheckoutLine[] = [{ variantId: "variant-1", productName: "Leather Bag", productSlug: "leather-bag", sku: "BAG-01", variantName: "Tan", unitPrice: "1000000", compareAtPrice: "1250000", quantity: 2, stock: 3 }];

describe("checkout domain", () => {
  it("menghitung total order dari data server", () => { const total = calculateCheckoutTotals(lines, "25000"); expect(total.subtotal.toFixed(2)).toBe("2000000.00"); expect(total.grandTotal.toFixed(2)).toBe("2025000.00"); });
  it("menerapkan voucher dengan batas diskon", () => { const total = calculateCheckoutTotals(lines, 25000, { id: "v1", code: "SAVE", type: "PERCENTAGE", value: 20, maxDiscount: 150000 }); expect(total.discountTotal.toFixed(2)).toBe("150000.00"); expect(total.grandTotal.toFixed(2)).toBe("1875000.00"); });
  it("membuat snapshot order item", () => { const [item] = createOrderLines(lines); expect(item).toMatchObject({ sku: "BAG-01", quantity: 2, productName: "Leather Bag" }); expect(item.lineTotal.toFixed(2)).toBe("2000000.00"); });
  it("menolak quantity di atas stock", () => { expect(() => calculateCheckoutTotals([{ ...lines[0], quantity: 4 }], 0)).toThrow("INSUFFICIENT_STOCK"); });
  it("menolak checkout tanpa stock", () => { expect(() => calculateCheckoutTotals([{ ...lines[0], stock: 0 }], 0)).toThrow("INSUFFICIENT_STOCK"); });
});
