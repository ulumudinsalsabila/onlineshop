import { z } from "zod";

const clean = (max: number) => z.string().trim().min(1).max(max).transform((value) => value.replace(/[<>]/g, "").replace(/\s+/g, " "));

export const addressSchema = z.object({
  label: clean(30), recipient: clean(80), phone: z.string().trim().transform((value) => value.replace(/[\s()-]/g, "")).pipe(z.string().regex(/^(?:\+62|62|0)8[1-9][0-9]{6,11}$/, "Enter a valid Indonesian mobile number.")), line1: clean(160), line2: clean(160).optional().or(z.literal("")), district: clean(80), city: clean(80), province: clean(80), postalCode: z.string().trim().regex(/^[0-9]{5}$/, "The postal code must contain five digits."), country: clean(60).default("Indonesia"), isDefault: z.boolean().default(false),
});
