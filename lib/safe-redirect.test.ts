import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safe redirect", () => {
  it("menerima path internal", () => expect(safeRedirectPath("/checkout?step=shipping")).toBe("/checkout?step=shipping"));
  it("menolak URL eksternal dan protocol-relative", () => { expect(safeRedirectPath("https://evil.test")).toBe("/account"); expect(safeRedirectPath("//evil.test")).toBe("/account"); expect(safeRedirectPath("/\\evil.test")).toBe("/account"); });
});
