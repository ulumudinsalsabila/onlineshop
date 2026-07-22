import { authenticatedBackendApi } from "@/lib/authenticated-backend-api";

export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";
export type SessionUser = { id: string; email: string; name: string | null; role: UserRole };

export async function auth() {
  try {
    const { data } = await authenticatedBackendApi<{ user: SessionUser }>("/auth/session", { cache: "no-store" });
    return { user: data.user };
  } catch {
    return null;
  }
}
