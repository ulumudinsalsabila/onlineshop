import { z } from "zod";

import { addressSchema } from "@/lib/address-schema";

export const paymentMethodSchema = z.enum(["BANK_TRANSFER", "CREDIT_CARD", "E_WALLET", "VIRTUAL_ACCOUNT"]);

export const shippingSelectionSchema = z.object({
  courierCode: z.string().trim().min(2).max(30).regex(/^[a-z0-9_-]+$/i),
  serviceCode: z.string().trim().min(1).max(50).regex(/^[a-z0-9 _-]+$/i),
});

export const checkoutSchema = z.object({
  addressId: z.string().cuid().optional(),
  address: addressSchema.optional(),
  shipping: shippingSelectionSchema,
  voucherCode: z.string().trim().toUpperCase().max(40).optional(),
  paymentMethod: paymentMethodSchema,
  notes: z.string().trim().max(500).transform((value) => value.replace(/[<>]/g, "")).optional(),
}).refine((data) => Boolean(data.addressId || data.address), { message: "Pilih atau tambahkan alamat pengiriman.", path: ["addressId"] });

export const ratesSchema = z.object({
  postalCode: z.string().regex(/^\d{5}$/),
  courierCodes: z.array(z.enum(["jne", "sicepat", "anteraja", "jnt"])).max(4).default(["jne", "sicepat", "anteraja"]),
});
