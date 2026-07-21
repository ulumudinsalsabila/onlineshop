import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password security", () => {
  it("hashes with Argon2id and verifies without storing plaintext", async () => {
    const password = "StrongDevelopmentPass123";
    const digest = await hashPassword(password);
    expect(digest).toMatch(/^\$argon2id\$/);
    expect(digest).not.toContain(password);
    await expect(verifyPassword(digest, password)).resolves.toBe(true);
    await expect(verifyPassword(digest, "WrongPassword123")).resolves.toBe(false);
  });
});
