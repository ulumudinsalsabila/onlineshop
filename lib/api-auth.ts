import { auth } from "@/auth";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function authenticateApi() {
  const session = await auth();
  if (!session?.user?.id) return { user: null, response: apiError("UNAUTHORIZED", "Sign in to continue.", 401) } as const;
  const user = await prisma.user.findFirst({ where: { id: session.user.id, isActive: true, deletedAt: null }, select: { id: true, email: true, name: true, role: true } });
  if (!user) return { user: null, response: apiError("UNAUTHORIZED", "Sesi tidak lagi valid.", 401) } as const;
  return { user, response: null } as const;
}
