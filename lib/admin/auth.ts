import { redirect } from "next/navigation";

import type { AdminPermission } from "./permissions";
import { hasAdminPermission, isBackofficeRole } from "./permissions";
import { getVerifiedUser } from "@/lib/auth-guard";
import { authenticateApi } from "@/lib/api-auth";
import { apiError } from "@/lib/api-response";

export async function requireAdmin(permission: AdminPermission = "dashboard:read") {
  const user = await getVerifiedUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent("/admin")}`);
  if (!isBackofficeRole(user.role)) redirect("/account");
  if (!hasAdminPermission(user.role, permission)) redirect("/admin/forbidden");
  return user;
}

export async function authorizeAdminApi(permission: AdminPermission) {
  const result = await authenticateApi();
  if (!result.user) return result;
  if (!isBackofficeRole(result.user.role)) return { user: null, response: apiError("FORBIDDEN", "Akses backoffice diperlukan.", 403) } as const;
  if (!hasAdminPermission(result.user.role, permission)) return { user: null, response: apiError("FORBIDDEN", "Your role does not allow this action.", 403) } as const;
  return result;
}
