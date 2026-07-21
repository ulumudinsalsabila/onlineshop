import { z } from "zod";

const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((value) => value === "" ? undefined : value, schema.optional());

const serverEnvironmentSchema = z.object({
  USE_MOCK_DATA: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  DATABASE_URL: optional(z.string().url().startsWith("postgresql://")),
  AUTH_SECRET: optional(z.string().min(32)),
  AUTH_URL: optional(z.string().url()),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: optional(z.string().min(1)),
  EMAIL_FROM: z.string().min(3).default("IVORY <noreply@example.com>"),
  MIDTRANS_SERVER_KEY: optional(z.string().min(1)),
  MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  BITESHIP_API_KEY: optional(z.string().min(1)),
  BITESHIP_BASE_URL: z.string().url().default("https://api.biteship.com/v1"),
  BITESHIP_ORIGIN_POSTAL_CODE: z.string().regex(/^\d{5}$/).default("12950"),
  CLOUDINARY_CLOUD_NAME: optional(z.string().min(1)),
  CLOUDINARY_API_KEY: optional(z.string().min(1)),
  CLOUDINARY_API_SECRET: optional(z.string().min(1)),
});

export const env = serverEnvironmentSchema.parse({
  USE_MOCK_DATA: process.env.USE_MOCK_DATA,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION,
  BITESHIP_API_KEY: process.env.BITESHIP_API_KEY,
  BITESHIP_BASE_URL: process.env.BITESHIP_BASE_URL,
  BITESHIP_ORIGIN_POSTAL_CODE: process.env.BITESHIP_ORIGIN_POSTAL_CODE,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
});

export const isMockDataMode = env.USE_MOCK_DATA || !env.DATABASE_URL;

export function requireDatabaseUrl() {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL belum dikonfigurasi. Salin .env.example menjadi .env dan isi connection string PostgreSQL.");
  return env.DATABASE_URL;
}
