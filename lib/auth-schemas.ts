import { z } from "zod";

import { normalizeEmail } from "./sanitize";

const password = z.string().min(10, "Password minimal 10 karakter.").max(128).regex(/[a-z]/, "Gunakan huruf kecil.").regex(/[A-Z]/, "Gunakan huruf besar.").regex(/[0-9]/, "Gunakan angka.");

export const loginSchema = z.object({ email: z.string().trim().email().transform(normalizeEmail), password: z.string().min(1).max(128) });
export const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().transform(normalizeEmail), password, confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { message: "Konfirmasi password tidak sama.", path: ["confirmPassword"] });
export const forgotPasswordSchema = z.object({ email: z.string().trim().email().transform(normalizeEmail) });
export const resetPasswordSchema = z.object({ email: z.string().trim().email().transform(normalizeEmail), token: z.string().min(20).max(200), password, confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { message: "Konfirmasi password tidak sama.", path: ["confirmPassword"] });
