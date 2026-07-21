import { Prisma } from "../../generated/prisma/client";

export type CheckoutLine = {
  variantId: string;
  productName: string;
  productSlug: string;
  sku: string;
  variantName: string;
  color?: string | null;
  size?: string | null;
  imageUrl?: string | null;
  unitPrice: string | number | Prisma.Decimal;
  compareAtPrice?: string | number | Prisma.Decimal | null;
  quantity: number;
  stock: number;
  weightGrams?: number | null;
};

export type CheckoutVoucher = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: string | number | Prisma.Decimal;
  minSpend?: string | number | Prisma.Decimal | null;
  maxDiscount?: string | number | Prisma.Decimal | null;
};

export type CheckoutTotals = {
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  shippingTotal: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
};

export function calculateCheckoutTotals(lines: CheckoutLine[], shippingCost: string | number | Prisma.Decimal, voucher?: CheckoutVoucher | null): CheckoutTotals {
  if (!lines.length) throw new Error("EMPTY_CART");
  const subtotal = lines.reduce((sum, line) => {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) throw new Error("INVALID_QUANTITY");
    if (line.quantity > line.stock) throw new Error("INSUFFICIENT_STOCK");
    return sum.add(new Prisma.Decimal(line.unitPrice).mul(line.quantity));
  }, new Prisma.Decimal(0));
  const shipping = Prisma.Decimal.max(new Prisma.Decimal(0), new Prisma.Decimal(shippingCost));
  let productDiscount = new Prisma.Decimal(0);
  let shippingDiscount = new Prisma.Decimal(0);

  if (voucher) {
    if (voucher.minSpend && subtotal.lt(voucher.minSpend)) throw new Error("VOUCHER_MIN_SPEND");
    if (voucher.type === "PERCENTAGE") productDiscount = subtotal.mul(voucher.value).div(100);
    if (voucher.type === "FIXED_AMOUNT") productDiscount = new Prisma.Decimal(voucher.value);
    if (voucher.type === "FREE_SHIPPING") shippingDiscount = Prisma.Decimal.min(shipping, new Prisma.Decimal(voucher.value || shipping));
    if (voucher.maxDiscount) productDiscount = Prisma.Decimal.min(productDiscount, new Prisma.Decimal(voucher.maxDiscount));
  }

  productDiscount = Prisma.Decimal.min(subtotal, productDiscount).toDecimalPlaces(2);
  const shippingTotal = shipping.sub(shippingDiscount).toDecimalPlaces(2);
  const discountTotal = productDiscount.add(shippingDiscount).toDecimalPlaces(2);
  return { subtotal, discountTotal, shippingTotal, grandTotal: subtotal.add(shipping).sub(discountTotal).toDecimalPlaces(2) };
}

export function createOrderLines(lines: CheckoutLine[]) {
  calculateCheckoutTotals(lines, 0);
  return lines.map((line) => ({
    variantId: line.variantId,
    productName: line.productName,
    productSlug: line.productSlug,
    sku: line.sku,
    variantName: line.variantName,
    colorSnapshot: line.color,
    sizeSnapshot: line.size,
    imageUrlSnapshot: line.imageUrl,
    unitPrice: new Prisma.Decimal(line.unitPrice),
    compareAtPrice: line.compareAtPrice == null ? null : new Prisma.Decimal(line.compareAtPrice),
    quantity: line.quantity,
    lineTotal: new Prisma.Decimal(line.unitPrice).mul(line.quantity),
    productSnapshot: { variantId: line.variantId, sku: line.sku },
  }));
}
