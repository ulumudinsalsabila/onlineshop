import type { CatalogProduct } from "../types/catalog";
import type { CartItemRecord, CartTotals, ResolvedCartLine } from "../types/commerce";

export const STANDARD_SHIPPING = 75_000;
export const FREE_SHIPPING_THRESHOLD = 2_500_000;
export const VOUCHER_CODE = "ELAN10";
export const VOUCHER_CAP = 500_000;

export function clampQuantity(quantity: number, stock: number): number {
  if (stock <= 0) return 0;
  const normalized = Number.isFinite(quantity) ? Math.floor(quantity) : 1;
  return Math.min(stock, Math.max(1, normalized));
}

export function isQuantityAvailable(quantity: number, stock: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= stock;
}

export function resolveCartLines(records: CartItemRecord[], products: CatalogProduct[]): ResolvedCartLine[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  return records.flatMap((record) => {
    const product = productMap.get(record.productId);
    if (!product) return [];
    const availableStock = Math.max(0, product.stock);
    const quantity = availableStock > 0 ? clampQuantity(record.quantity, availableStock) : Math.max(1, Math.floor(record.quantity) || 1);
    return [{ ...record, quantity, product, unitPrice: product.price, lineTotal: product.price * quantity, availableStock, canCheckout: availableStock > 0 && quantity <= availableStock && !product.soldOut }];
  });
}

export function calculateCartTotals(lines: ResolvedCartLine[], voucher = ""): CartTotals {
  const subtotal = lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
  const voucherApplied = voucher.trim().toUpperCase() === VOUCHER_CODE;
  const discount = voucherApplied ? Math.min(Math.round(subtotal * 0.1), VOUCHER_CAP) : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = subtotal === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  return { subtotal, discount, shipping, grandTotal: afterDiscount + shipping, voucherApplied };
}

export function createCartItemId(productId: string, color: string, size: string): string {
  return [productId, color || "default", size || "default"].join(":");
}

