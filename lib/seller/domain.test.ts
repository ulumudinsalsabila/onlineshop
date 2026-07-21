import { describe, expect, it } from "vitest";
import { assertSubmissionTransition, calculateCommission, calculatePayoutAmount, canTransitionSubmission, ownsSellerResource } from "./domain";

describe("seller authorization", () => { it("hanya mengizinkan pemilik resource", () => { expect(ownsSellerResource("u1", "u1")).toBe(true); expect(ownsSellerResource("u1", "u2")).toBe(false); }); });
describe("consignment status", () => {
  it("mengikuti alur tanpa lompatan", () => { expect(canTransitionSubmission("DRAFT", "SUBMITTED", "SELLER")).toBe(true); expect(canTransitionSubmission("SUBMITTED", "LISTED", "ADMIN")).toBe(false); expect(canTransitionSubmission("READY_TO_LIST", "LISTED", "ADMIN")).toBe(true); });
  it("mewajibkan alasan untuk keputusan negatif", () => { expect(() => assertSubmissionTransition({ current: "UNDER_REVIEW", next: "REJECTED", actor: "ADMIN" })).toThrow("TRANSITION_REASON_REQUIRED"); });
});
describe("consignment money", () => {
  it("menghitung komisi dan net seller dengan Decimal", () => { const result = calculateCommission({ grossAmount: "10000000", rate: "20", fixedFee: "50000" }); expect(result.commissionAmount.toFixed(2)).toBe("2050000.00"); expect(result.sellerNetAmount.toFixed(2)).toBe("7950000.00"); });
  it("menghitung payout dari item eligible", () => { expect(calculatePayoutAmount([{ amount: "7950000" }, { amount: "1000000" }]).toFixed(2)).toBe("8950000.00"); });
});
