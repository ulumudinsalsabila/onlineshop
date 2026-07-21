import type { UserRole } from "@/generated/prisma/client";

export const adminPermissions = [
  "dashboard:read", "products:read", "products:write", "categories:read", "categories:write",
  "brands:read", "brands:write", "orders:read", "orders:write", "customers:read", "customers:write",
  "vouchers:read", "vouchers:write", "content:read", "content:write", "reports:read", "audit:read",
  "sellers:read", "sellers:write", "payouts:read", "payouts:write",
] as const;
export type AdminPermission = (typeof adminPermissions)[number];

const staffPermissions: AdminPermission[] = ["dashboard:read", "products:read", "products:write", "categories:read", "brands:read", "orders:read", "orders:write", "customers:read", "content:read", "content:write"];

export function permissionsForRole(role: UserRole): AdminPermission[] {
  if (role === "ADMIN") return [...adminPermissions];
  if (role === "STAFF") return staffPermissions;
  return [];
}

export function hasAdminPermission(role: UserRole, permission: AdminPermission) { return permissionsForRole(role).includes(permission); }
export function isBackofficeRole(role: UserRole) { return role === "STAFF" || role === "ADMIN"; }
