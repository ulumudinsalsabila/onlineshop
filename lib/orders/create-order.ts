import { randomUUID } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { calculateCheckoutTotals, createOrderLines, type CheckoutLine, type CheckoutVoucher } from "@/lib/checkout/domain";
import type { z } from "zod";
import type { checkoutSchema } from "@/lib/checkout/schemas";
import { env } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { getShippingProvider, type ShippingQuote } from "@/lib/shipping";

export type CheckoutInput = z.infer<typeof checkoutSchema> & { userId: string };

function addressSnapshot(address: { recipient: string; phone: string; line1: string; line2?: string | null; district: string; city: string; province: string; postalCode: string; country: string }) {
  return { recipient: address.recipient, phone: address.phone, line1: address.line1, line2: address.line2 ?? null, district: address.district, city: address.city, province: address.province, postalCode: address.postalCode, country: address.country };
}

async function loadCartLines(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { activeKey: `user:${userId}` }, include: { items: { include: { variant: { include: { inventory: true, product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } } } });
  if (!cart?.items.length) throw new Error("EMPTY_CART");
  return { cart, lines: cart.items.map((item): CheckoutLine => ({ variantId: item.variant.id, productName: item.variant.product.name, productSlug: item.variant.product.slug, sku: item.variant.sku, variantName: item.variant.name, color: item.variant.color, size: item.variant.size, imageUrl: item.variant.product.images[0]?.url, unitPrice: item.variant.price ?? item.variant.product.price, compareAtPrice: item.variant.compareAtPrice ?? item.variant.product.compareAtPrice, quantity: item.quantity, stock: Math.max(0, (item.variant.inventory?.quantity ?? 0) - (item.variant.inventory?.reserved ?? 0)), weightGrams: item.variant.product.weightGrams })) };
}

async function resolveAddress(input: CheckoutInput) {
  if (input.addressId) {
    const address = await prisma.address.findFirst({ where: { id: input.addressId, userId: input.userId } });
    if (!address) throw new Error("ADDRESS_NOT_FOUND");
    return addressSnapshot(address);
  }
  if (!input.address) throw new Error("ADDRESS_REQUIRED");
  return addressSnapshot({ ...input.address, line2: input.address.line2 || null });
}

async function resolveShipping(userId: string, postalCode: string, selected: CheckoutInput["shipping"]): Promise<ShippingQuote> {
  const { lines } = await loadCartLines(userId);
  const quotes = await getShippingProvider().getRates({ destinationPostalCode: postalCode, courierCodes: [selected.courierCode], items: lines.map((line) => ({ name: line.productName, value: new Prisma.Decimal(line.unitPrice).toNumber(), weightGrams: line.weightGrams ?? 1000, quantity: line.quantity })) });
  const quote = quotes.find((item) => item.courierCode.toLowerCase() === selected.courierCode.toLowerCase() && item.serviceCode.toLowerCase() === selected.serviceCode.toLowerCase());
  if (!quote) throw new Error("SHIPPING_OPTION_INVALID");
  return quote;
}

async function resolveVoucher(tx: Prisma.TransactionClient, code: string | undefined, userId: string, subtotal: Prisma.Decimal): Promise<CheckoutVoucher | null> {
  if (!code) return null;
  const now = new Date();
  const voucher = await tx.voucher.findFirst({ where: { code, isActive: true, startsAt: { lte: now }, endsAt: { gte: now } } });
  if (!voucher || (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit)) throw new Error("VOUCHER_INVALID");
  const userUsage = await tx.voucherUsage.count({ where: { voucherId: voucher.id, userId } });
  if (userUsage >= voucher.usagePerUser) throw new Error("VOUCHER_LIMIT_REACHED");
  if (voucher.minSpend && subtotal.lt(voucher.minSpend)) throw new Error("VOUCHER_MIN_SPEND");
  return voucher;
}

export async function getCheckoutContext(userId: string) {
  const [{ lines }, user, addresses] = await Promise.all([loadCartLines(userId), prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, email: true, phone: true } }), prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] })]);
  return { customer: user, addresses, items: lines.map((line) => ({ ...line, unitPrice: new Prisma.Decimal(line.unitPrice).toNumber(), compareAtPrice: line.compareAtPrice == null ? null : new Prisma.Decimal(line.compareAtPrice).toNumber() })) };
}

export async function quoteShipping(userId: string, postalCode: string, courierCodes: string[]) {
  const { lines } = await loadCartLines(userId);
  return getShippingProvider().getRates({ destinationPostalCode: postalCode, courierCodes, items: lines.map((line) => ({ name: line.productName, value: new Prisma.Decimal(line.unitPrice).toNumber(), weightGrams: line.weightGrams ?? 1000, quantity: line.quantity })) });
}

export async function previewCheckout(input: CheckoutInput) {
  const address = await resolveAddress(input);
  const shipping = await resolveShipping(input.userId, address.postalCode, input.shipping);
  const { lines } = await loadCartLines(input.userId);
  return prisma.$transaction(async (tx) => {
    const subtotal = calculateCheckoutTotals(lines, 0).subtotal;
    const voucher = await resolveVoucher(tx, input.voucherCode, input.userId, subtotal);
    const totals = calculateCheckoutTotals(lines, shipping.cost, voucher);
    return { ...Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, value.toNumber()])), voucherCode: voucher?.code ?? null, shipping };
  });
}

export async function createOrderFromActiveCart(input: CheckoutInput) {
  const address = await resolveAddress(input);
  const shipping = await resolveShipping(input.userId, address.postalCode, input.shipping);
  const provider = getPaymentProvider();
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: input.userId }, select: { email: true, name: true, phone: true } });
    const cart = await tx.cart.findUnique({ where: { activeKey: `user:${input.userId}` }, include: { items: { include: { variant: { include: { inventory: true, product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } } } });
    if (!cart?.items.length) throw new Error("EMPTY_CART");
    const lines: CheckoutLine[] = cart.items.map((item) => ({ variantId: item.variant.id, productName: item.variant.product.name, productSlug: item.variant.product.slug, sku: item.variant.sku, variantName: item.variant.name, color: item.variant.color, size: item.variant.size, imageUrl: item.variant.product.images[0]?.url, unitPrice: item.variant.price ?? item.variant.product.price, compareAtPrice: item.variant.compareAtPrice ?? item.variant.product.compareAtPrice, quantity: item.quantity, stock: Math.max(0, (item.variant.inventory?.quantity ?? 0) - (item.variant.inventory?.reserved ?? 0)), weightGrams: item.variant.product.weightGrams }));
    const subtotal = calculateCheckoutTotals(lines, 0).subtotal;
    const voucher = await resolveVoucher(tx, input.voucherCode, input.userId, subtotal);
    const totals = calculateCheckoutTotals(lines, shipping.cost, voucher);
    for (const item of cart.items) {
      const inventory = item.variant.inventory;
      if (!inventory) throw new Error("INSUFFICIENT_STOCK");
      const reserved = await tx.inventory.updateMany({ where: { id: inventory.id, version: inventory.version, quantity: { gte: inventory.reserved + item.quantity } }, data: { reserved: { increment: item.quantity }, version: { increment: 1 } } });
      if (reserved.count !== 1) throw new Error("INSUFFICIENT_STOCK");
    }
    const orderNumber = `IV-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const order = await tx.order.create({ data: { orderNumber, userId: input.userId, customerEmail: user.email, customerName: user.name ?? address.recipient, customerPhone: user.phone ?? address.phone, shippingAddress: address, subtotal: totals.subtotal, discountTotal: totals.discountTotal, shippingTotal: totals.shippingTotal, grandTotal: totals.grandTotal, voucherCode: voucher?.code, shippingMethod: `${shipping.courierCode}:${shipping.serviceCode}`, shippingEstimate: shipping.estimateLabel, notes: input.notes, items: { create: createOrderLines(lines) }, payments: { create: { provider: provider.name, idempotencyKey: `checkout:${orderNumber}`, method: input.paymentMethod, amount: totals.grandTotal } }, shipments: { create: { provider: shipping.provider, courier: shipping.courierCode, service: shipping.serviceCode, shippingCost: totals.shippingTotal, estimateMinDays: shipping.estimateMinDays, estimateMaxDays: shipping.estimateMaxDays, metadata: { quote: shipping } } } }, include: { items: true, payments: true } });
    if (voucher) { await tx.voucherUsage.create({ data: { voucherId: voucher.id, userId: input.userId, orderId: order.id, discountAmount: totals.discountTotal } }); await tx.voucher.update({ where: { id: voucher.id }, data: { usedCount: { increment: 1 } } }); }
    await tx.cart.update({ where: { id: cart.id }, data: { status: "CONVERTED", activeKey: null } });
    return order;
  }, { isolationLevel: "Serializable", maxWait: 5_000, timeout: 20_000 });

  try {
    const payment = await provider.createTransaction({ orderNumber: result.orderNumber, amount: result.grandTotal.toNumber(), customer: { name: result.customerName, email: result.customerEmail, phone: result.customerPhone }, items: [{ id: result.orderNumber, name: `Pesanan ${result.orderNumber}`, price: result.grandTotal.toNumber(), quantity: 1 }], finishUrl: `${env.NEXT_PUBLIC_APP_URL}/checkout/pending` });
    await prisma.payment.update({ where: { id: result.payments[0].id }, data: { providerRef: payment.providerRef, redirectUrl: payment.redirectUrl, snapToken: payment.token, expiresAt: payment.expiresAt, metadata: payment.raw as Prisma.InputJsonValue } });
    return { orderId: result.id, orderNumber: result.orderNumber, redirectUrl: payment.redirectUrl, provider: provider.name };
  } catch (error) {
    await cancelUnpaidOrder(result.id, "PAYMENT_PROVIDER_ERROR");
    throw error;
  }
}

export async function cancelUnpaidOrder(orderId: string, failureCode: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, payments: true, voucherUsages: true } });
    if (!order || order.paymentStatus !== "PENDING") return;
    for (const item of order.items) if (item.variantId) await tx.inventory.updateMany({ where: { variantId: item.variantId, reserved: { gte: item.quantity } }, data: { reserved: { decrement: item.quantity }, version: { increment: 1 } } });
    await tx.payment.updateMany({ where: { orderId, status: "PENDING" }, data: { status: "FAILED", failureCode } });
    for (const usage of order.voucherUsages) {
      await tx.voucherUsage.delete({ where: { id: usage.id } });
      await tx.voucher.update({ where: { id: usage.voucherId }, data: { usedCount: { decrement: 1 } } });
    }
    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED", paymentStatus: "FAILED", cancelledAt: new Date() } });
  });
}
