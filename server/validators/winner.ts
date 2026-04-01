import { z } from "zod";
import { PAYOUT_STATUSES, WINNER_VERIFICATION_STATUSES } from "@/server/domain/constants";

export const winnerReviewSchema = z.object({
  verificationStatus: z.enum([
    WINNER_VERIFICATION_STATUSES.APPROVED,
    WINNER_VERIFICATION_STATUSES.REJECTED
  ]).refine(
    (value) =>
      value === WINNER_VERIFICATION_STATUSES.APPROVED ||
      value === WINNER_VERIFICATION_STATUSES.REJECTED,
    "Verification status must be APPROVED or REJECTED."
  )
});

export const payoutUpdateSchema = z.object({
  payoutStatus: z.enum([PAYOUT_STATUSES.PENDING, PAYOUT_STATUSES.PAID])
});
