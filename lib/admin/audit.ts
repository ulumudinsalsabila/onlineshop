import type { Prisma } from "@/generated/prisma/client";

export async function writeAuditLog(tx: Prisma.TransactionClient, input: { userId: string; action: string; entityType: string; entityId?: string | null; metadata?: Prisma.InputJsonValue; request?: Request }) {
  const forwarded = input.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return tx.auditLog.create({ data: { userId: input.userId, action: input.action, entityType: input.entityType, entityId: input.entityId, ipAddress: forwarded ?? input.request?.headers.get("x-real-ip"), userAgent: input.request?.headers.get("user-agent"), metadata: input.metadata } });
}
