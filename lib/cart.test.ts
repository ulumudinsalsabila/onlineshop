import { describe, expect, it } from "vitest";

import { formatIDR } from "./formatters";
import { calculateCartTotals, clampQuantity, isQuantityAvailable, resolveCartLines, STANDARD_SHIPPING, VOUCHER_CAP } from "./cart";
import type { CatalogProduct } from "../types/catalog";

const product: CatalogProduct = {
  id: "test-product", slug: "test-product", brand: "Test", brandSlug: "test", name: "Test Product", category: "Bags", categorySlug: "bags", price: 2_000_000,
  image: "/test.png", hoverImage: "/test-2.png", conditionType: "new", colors: ["black"], sizes: ["One Size"], stock: 3, createdAt: "2026-01-01", salesCount: 0,
};

describe("formatIDR", () => {
  it("memformat angka sebagai Rupiah tanpa pecahan", () => {
    expect(formatIDR(1_234_567).replace(/\s/g, "")).toBe("Rp1.234.567");
  });
});

describe("cart calculations", () => {
  const lines = resolveCartLines([{ id: "line", productId: product.id, color: "black", size: "One Size", quantity: 2 }], [product]);

  it("menghitung subtotal dari harga katalog, bukan total client", () => {
    expect(lines[0]?.lineTotal).toBe(4_000_000);
    expect(calculateCartTotals(lines).subtotal).toBe(4_000_000);
  });

  it("menerapkan voucher 10% dengan batas diskon", () => {
    const totals = calculateCartTotals(lines, "elan10");
    expect(totals.discount).toBe(400_000);
    expect(totals.voucherApplied).toBe(true);
    expect(calculateCartTotals([{ ...lines[0]!, lineTotal: 20_000_000, unitPrice: 10_000_000, quantity: 2 }], "ELAN10").discount).toBe(VOUCHER_CAP);
  });

  it("menambahkan ongkir untuk subtotal di bawah batas gratis ongkir", () => {
    const lowValueLines = resolveCartLines([{ id: "line", productId: product.id, color: "black", size: "One Size", quantity: 1 }], [product]);
    expect(calculateCartTotals(lowValueLines).shipping).toBe(STANDARD_SHIPPING);
  });
});

describe("quantity and stock", () => {
  it("membatasi quantity sesuai stok", () => {
    expect(clampQuantity(9, 3)).toBe(3);
    expect(clampQuantity(0, 3)).toBe(1);
    expect(clampQuantity(2, 0)).toBe(0);
  });

  it("memvalidasi quantity terhadap stok", () => {
    expect(isQuantityAvailable(3, 3)).toBe(true);
    expect(isQuantityAvailable(4, 3)).toBe(false);
    expect(isQuantityAvailable(0, 3)).toBe(false);
  });
});

