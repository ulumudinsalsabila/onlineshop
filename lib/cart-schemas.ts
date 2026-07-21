import { z } from "zod";

export const addCartItemSchema = z.object({ variantId: z.string().cuid(), quantity: z.coerce.number().int().min(1).max(20).default(1) });
export const updateCartItemSchema = z.object({ quantity: z.coerce.number().int().min(1).max(20) });
