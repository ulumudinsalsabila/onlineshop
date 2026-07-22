import { redirect } from "next/navigation";

import type { AdminPermission } from "./permissions";
import { hasAdminPermission, isBackofficeRole } from "./permissions";
import { getVerifiedUser } from "@/lib/auth-guard";

export async function requireAdmin(permission: AdminPermission = "dashboard:read") {
  const user = await getVerifiedUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent("/admin")}`);
  if (!isBackofficeRole(user.role)) redirect("/account");
  if (!hasAdminPermission(user.role, permission)) redirect("/admin/forbidden");
  return user;
}
