import type { Prisma } from "@/generated/prisma/client";

export function logSellerActivity(tx: Prisma.TransactionClient, input: { sellerId: string; actorUserId?: string | null; action: string; entityType: string; entityId?: string | null; moneyBefore?: Prisma.Decimal | null; moneyAfter?: Prisma.Decimal | null; metadata?: Prisma.InputJsonValue }) { return tx.sellerActivityLog.create({ data: input }); }
