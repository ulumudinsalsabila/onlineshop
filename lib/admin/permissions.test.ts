import { describe, expect, it } from "vitest";
import { hasAdminPermission, isBackofficeRole, permissionsForRole } from "./permissions";

describe("admin authorization", () => {
  it("menolak CUSTOMER dari backoffice", () => { expect(isBackofficeRole("CUSTOMER")).toBe(false); expect(permissionsForRole("CUSTOMER")).toEqual([]); });
  it("membatasi STAFF dari modul sensitif", () => { expect(hasAdminPermission("STAFF", "orders:write")).toBe(true); expect(hasAdminPermission("STAFF", "customers:write")).toBe(false); expect(hasAdminPermission("STAFF", "audit:read")).toBe(false); expect(hasAdminPermission("STAFF", "sellers:write")).toBe(false); expect(hasAdminPermission("STAFF", "payouts:write")).toBe(false); });
  it("memberi ADMIN akses penuh", () => { expect(hasAdminPermission("ADMIN", "audit:read")).toBe(true); expect(hasAdminPermission("ADMIN", "vouchers:write")).toBe(true); expect(hasAdminPermission("ADMIN", "sellers:write")).toBe(true); expect(hasAdminPermission("ADMIN", "payouts:write")).toBe(true); });
});
