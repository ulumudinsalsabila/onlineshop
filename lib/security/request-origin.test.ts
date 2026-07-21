import { describe, expect, it } from "vitest";
import { isTrustedMutationRequest } from "./request-origin";

describe("CSRF origin validation", () => {
  it("menerima same-origin dan request read-only", () => { expect(isTrustedMutationRequest(new Request("https://ivory.id/api/cart", { method: "POST", headers: { origin: "https://ivory.id" } }))).toBe(true); expect(isTrustedMutationRequest(new Request("https://ivory.id/api/cart", { method: "GET", headers: { origin: "https://evil.test" } }))).toBe(true); });
  it("menolak mutation cross-site", () => { expect(isTrustedMutationRequest(new Request("https://ivory.id/api/cart", { method: "POST", headers: { origin: "https://evil.test", "sec-fetch-site": "cross-site" } }))).toBe(false); });
});
