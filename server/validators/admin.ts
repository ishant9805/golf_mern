import { z } from "zod";
import {
  DRAW_TYPES,
  PAYOUT_STATUSES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  USER_ROLES,
  WINNER_VERIFICATION_STATUSES
} from "@/server/domain/constants";

export const adminUserUpdateSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  role: z.enum([USER_ROLES.PUBLIC, USER_ROLES.SUBSCRIBER, USER_ROLES.ADMIN]),
  selectedCharityId: z.string().cuid().nullable(),
  charityPercentage: z.number().min(10).max(100)
});

export const adminSubscriptionUpdateSchema = z.object({
  plan: z.enum([SUBSCRIPTION_PLANS.MONTHLY, SUBSCRIPTION_PLANS.YEARLY]),
  status: z.enum([
    SUBSCRIPTION_STATUSES.INCOMPLETE,
    SUBSCRIPTION_STATUSES.ACTIVE,
    SUBSCRIPTION_STATUSES.PAST_DUE,
    SUBSCRIPTION_STATUSES.CANCELED,
    SUBSCRIPTION_STATUSES.EXPIRED
  ]),
  currentPeriodStart: z.string().datetime().nullable(),
  currentPeriodEnd: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean()
});

export const adminDrawSimulationSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  title: z.string().min(3).max(120),
  drawType: z.enum([DRAW_TYPES.RANDOM, DRAW_TYPES.ALGORITHMIC]),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export const adminWinnerReviewSchema = z.object({
  verificationStatus: z.enum([
    WINNER_VERIFICATION_STATUSES.APPROVED,
    WINNER_VERIFICATION_STATUSES.REJECTED
  ])
});

export const adminWinnerPayoutSchema = z.object({
  payoutStatus: z.enum([PAYOUT_STATUSES.PENDING, PAYOUT_STATUSES.PAID])
});
