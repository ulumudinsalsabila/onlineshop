import { z } from "zod";

import { normalizeEmail } from "./sanitize";

const password = z.string().min(10, "Password must contain at least 10 characters.").max(128).regex(/[a-z]/, "Use at least one lowercase letter.").regex(/[A-Z]/, "Use at least one uppercase letter.").regex(/[0-9]/, "Use at least one number.");

export const loginSchema = z.object({ email: z.string().trim().email().transform(normalizeEmail), password: z.string().min(1).max(128) });
export const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().transform(normalizeEmail), password, confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { message: "The password confirmation does not match.", path: ["confirmPassword"] });
export const forgotPasswordSchema = z.object({ email: z.string().trim().email().transform(normalizeEmail) });
export const resetPasswordSchema = z.object({ email: z.string().trim().email().transform(normalizeEmail), token: z.string().min(20).max(200), password, confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { message: "The password confirmation does not match.", path: ["confirmPassword"] });
