import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./auth-schemas";

describe("authentication validation", () => {
  it("normalizes email before authentication", () => {
    expect(loginSchema.parse({ email: "  CLIENT@Example.COM ", password: "secret" }).email).toBe("client@example.com");
  });

  it("rejects weak or mismatched registration passwords", () => {
    expect(registerSchema.safeParse({ name: "Nadia", email: "nadia@example.com", phone: "+628123456789", password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Nadia", email: "nadia@example.com", phone: "+628123456789", password: "StrongPass123", confirmPassword: "StrongPass124" }).success).toBe(false);
  });

  it("requires an international phone number for registration", () => {
    expect(registerSchema.safeParse({ name: "Nadia", email: "nadia@example.com", phone: "+628123456789", password: "StrongPass123", confirmPassword: "StrongPass123" }).success).toBe(true);
    expect(registerSchema.safeParse({ name: "Nadia", email: "nadia@example.com", phone: "081234", password: "StrongPass123", confirmPassword: "StrongPass123" }).success).toBe(false);
  });
});
