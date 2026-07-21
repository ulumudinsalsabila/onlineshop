import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./auth-schemas";

describe("authentication validation", () => {
  it("normalizes email before authentication", () => {
    expect(loginSchema.parse({ email: "  CLIENT@Example.COM ", password: "secret" }).email).toBe("client@example.com");
  });

  it("rejects weak or mismatched registration passwords", () => {
    expect(registerSchema.safeParse({ name: "Nadia", email: "nadia@example.com", password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Nadia", email: "nadia@example.com", password: "StrongPass123", confirmPassword: "StrongPass124" }).success).toBe(false);
  });
});
