import { Prisma, type ConsignmentStatus } from "../../generated/prisma/client";

export type SubmissionActor = "SELLER" | "ADMIN";
const transitions: Record<ConsignmentStatus, ConsignmentStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["NEEDS_REVISION", "APPROVED", "REJECTED"],
  NEEDS_REVISION: ["SUBMITTED", "CANCELLED"],
  APPROVED: ["WAITING_FOR_ITEM", "CANCELLED"],
  REJECTED: [],
  WAITING_FOR_ITEM: ["INSPECTION", "CANCELLED"],
  INSPECTION: ["NEEDS_REVISION", "READY_TO_LIST", "REJECTED"],
  READY_TO_LIST: ["LISTED", "CANCELLED"],
  LISTED: ["SOLD", "CANCELLED"],
  SOLD: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const sellerTransitions = new Set(["DRAFT:SUBMITTED", "DRAFT:CANCELLED", "NEEDS_REVISION:SUBMITTED", "NEEDS_REVISION:CANCELLED", "APPROVED:WAITING_FOR_ITEM", "APPROVED:CANCELLED"]);

export function canTransitionSubmission(current: ConsignmentStatus, next: ConsignmentStatus, actor: SubmissionActor) {
  if (!transitions[current].includes(next)) return false;
  return actor === "SELLER" ? sellerTransitions.has(`${current}:${next}`) : !sellerTransitions.has(`${current}:${next}`) || current === "APPROVED";
}

export function assertSubmissionTransition(input: { current: ConsignmentStatus; next: ConsignmentStatus; actor: SubmissionActor; reason?: string | null }) {
  if (!canTransitionSubmission(input.current, input.next, input.actor)) throw new Error("INVALID_SUBMISSION_TRANSITION");
  if (["NEEDS_REVISION", "REJECTED", "CANCELLED"].includes(input.next) && !input.reason?.trim()) throw new Error("TRANSITION_REASON_REQUIRED");
}

type DecimalInput = string | number | Prisma.Decimal;

export function calculateCommission(input: { grossAmount: DecimalInput; rate: DecimalInput; fixedFee?: DecimalInput }) {
  const gross = new Prisma.Decimal(input.grossAmount); const rate = new Prisma.Decimal(input.rate); const fixed = new Prisma.Decimal(input.fixedFee ?? 0);
  if (gross.lte(0) || rate.lt(0) || rate.gt(100) || fixed.lt(0)) throw new Error("INVALID_COMMISSION_INPUT");
  const commissionAmount = Prisma.Decimal.min(gross, gross.mul(rate).div(100).add(fixed)).toDecimalPlaces(2);
  return { grossAmount: gross.toDecimalPlaces(2), commissionAmount, sellerNetAmount: gross.sub(commissionAmount).toDecimalPlaces(2) };
}

export function calculatePayoutAmount(items: { amount: DecimalInput }[]) {
  if (!items.length) throw new Error("NO_ELIGIBLE_PAYOUT_ITEMS");
  const amount = items.reduce((sum, item) => sum.add(item.amount), new Prisma.Decimal(0)).toDecimalPlaces(2);
  if (amount.lte(0)) throw new Error("INVALID_PAYOUT_AMOUNT");
  return amount;
}

export function ownsSellerResource(userId: string, ownerUserId: string) { return Boolean(userId) && userId === ownerUserId; }
