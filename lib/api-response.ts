import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
export type ApiFailure = { success: false; error: { code: string; message: string; details?: unknown } };

export function apiSuccess<T>(data: T, init?: ResponseInit, meta?: Record<string, unknown>) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data, ...(meta ? { meta } : {}) }, init);
}

export function apiError(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json<ApiFailure>({ success: false, error: { code, message, ...(details ? { details } : {}) } }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) return apiError("VALIDATION_ERROR", "Data yang dikirim tidak valid.", 422, error.flatten());
  if (error instanceof SyntaxError) return apiError("INVALID_JSON", "Request body harus berupa JSON yang valid.", 400);
  console.error("API error", error);
  return apiError("INTERNAL_ERROR", "Terjadi kesalahan pada server.", 500);
}
