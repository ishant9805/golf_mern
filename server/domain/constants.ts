export const USER_ROLES = {
  PUBLIC: "PUBLIC",
  SUBSCRIBER: "SUBSCRIBER",
  ADMIN: "ADMIN"
} as const;

export const SUBSCRIPTION_PLANS = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY"
} as const;

export const SUBSCRIPTION_STATUSES = {
  INCOMPLETE: "INCOMPLETE",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
  EXPIRED: "EXPIRED"
} as const;

export const DRAW_TYPES = {
  RANDOM: "RANDOM",
  ALGORITHMIC: "ALGORITHMIC"
} as const;

export const DRAW_STATUSES = {
  DRAFT: "DRAFT",
  SIMULATED: "SIMULATED",
  PUBLISHED: "PUBLISHED"
} as const;

export const WINNER_VERIFICATION_STATUSES = {
  NOT_REQUIRED: "NOT_REQUIRED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
} as const;

export const PAYOUT_STATUSES = {
  PENDING: "PENDING",
  PAID: "PAID"
} as const;

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED"
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];
export type DrawType = (typeof DRAW_TYPES)[keyof typeof DRAW_TYPES];
export type DrawStatus = (typeof DRAW_STATUSES)[keyof typeof DRAW_STATUSES];
export type WinnerVerificationStatus =
  (typeof WINNER_VERIFICATION_STATUSES)[keyof typeof WINNER_VERIFICATION_STATUSES];
export type PayoutStatus = (typeof PAYOUT_STATUSES)[keyof typeof PAYOUT_STATUSES];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
