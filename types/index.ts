import type {
  DrawStatus,
  DrawType,
  PaymentStatus,
  PayoutStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
  WinnerVerificationStatus
} from "@/server/domain/constants";

export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  charityPercentage: number;
  selectedCharityId: string | null;
};

export type SessionUser = SafeUser & {
  subscriptionStatus: SubscriptionStatus | null;
  hasActiveSubscription: boolean;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type PlanDefinition = {
  plan: SubscriptionPlan;
  label: string;
  price: number;
  interval: "month" | "year";
  stripePriceId: string;
};

export type DrawNumbers = [number, number, number, number, number];

export type DrawSummary = {
  id: string;
  monthKey: string;
  title: string;
  drawType: DrawType;
  status: DrawStatus;
  generatedNumbers: DrawNumbers;
  prizePoolTotal: number;
  jackpotRollover: number;
  publishedAt: string | null;
};

export type WinnerRecord = {
  id: string;
  userName: string;
  matchedCount: number;
  prizeAmount: number;
  verificationStatus: WinnerVerificationStatus;
  payoutStatus: PayoutStatus;
};

export type PaymentRecord = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
};
