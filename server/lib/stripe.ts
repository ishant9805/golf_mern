import Stripe from "stripe";
import { env } from "@/server/lib/env";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/server/domain/constants";
import type { PlanDefinition } from "@/types";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil"
});

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    plan: SUBSCRIPTION_PLANS.MONTHLY,
    label: "Monthly Impact",
    price: 29,
    interval: "month",
    stripePriceId: env.STRIPE_MONTHLY_PRICE_ID
  },
  {
    plan: SUBSCRIPTION_PLANS.YEARLY,
    label: "Yearly Impact",
    price: 290,
    interval: "year",
    stripePriceId: env.STRIPE_YEARLY_PRICE_ID
  }
];

export function getPlanDefinition(plan: SubscriptionPlan) {
  const found = PLAN_DEFINITIONS.find((item) => item.plan === plan);
  if (!found) {
    throw new Error(`Unknown subscription plan: ${plan}`);
  }
  return found;
}
