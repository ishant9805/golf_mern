import type Stripe from "stripe";
import {
  PAYMENT_STATUSES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  type SubscriptionPlan,
  type SubscriptionStatus
} from "@/server/domain/constants";
import { prisma } from "@/server/lib/prisma";
import { env } from "@/server/lib/env";
import { getPlanDefinition, stripe } from "@/server/lib/stripe";
import { notify } from "@/server/lib/notifications";

function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return SUBSCRIPTION_STATUSES.ACTIVE;
    case "past_due":
      return SUBSCRIPTION_STATUSES.PAST_DUE;
    case "canceled":
      return SUBSCRIPTION_STATUSES.CANCELED;
    case "incomplete":
    case "incomplete_expired":
      return SUBSCRIPTION_STATUSES.INCOMPLETE;
    case "unpaid":
      return SUBSCRIPTION_STATUSES.EXPIRED;
    case "trialing":
      return SUBSCRIPTION_STATUSES.ACTIVE;
    case "paused":
      return SUBSCRIPTION_STATUSES.PAST_DUE;
    default:
      return SUBSCRIPTION_STATUSES.INCOMPLETE;
  }
}

export async function ensureStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) throw new Error("User not found.");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName,
    metadata: {
      userId: user.id
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id }
  });

  return customer.id;
}

export async function createCheckoutSession(userId: string, plan: SubscriptionPlan) {
  const customerId = await ensureStripeCustomer(userId);
  const planDef = getPlanDefinition(plan);
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: planDef.stripePriceId,
        quantity: 1
      }
    ],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
    metadata: {
      userId,
      plan
    }
  });

  await prisma.payment.create({
    data: {
      userId,
      stripeCheckoutSession: session.id,
      amount: planDef.price,
      currency: "USD",
      status: PAYMENT_STATUSES.PENDING
    }
  });

  return session;
}

export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) throw new Error("User not found for Stripe customer.");

  const stripePriceId = subscription.items.data[0]?.price.id;
  const plan =
    stripePriceId === env.STRIPE_YEARLY_PRICE_ID
      ? SUBSCRIPTION_PLANS.YEARLY
      : SUBSCRIPTION_PLANS.MONTHLY;

  const currentPeriodStart = subscription.items.data[0]?.current_period_start
    ? new Date(subscription.items.data[0].current_period_start * 1000)
    : null;

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end
    ? new Date(subscription.items.data[0].current_period_end * 1000)
    : null;

  const mappedStatus = mapStripeSubscriptionStatus(subscription.status);

  const savedSubscription = await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      plan,
      status: mappedStatus,
      stripePriceId: stripePriceId ?? "",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    },
    create: {
      userId: user.id,
      plan,
      status: mappedStatus,
      stripeSubscriptionId: subscription.id,
      stripePriceId: stripePriceId ?? "",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });

  notify("info", `Subscription synced for ${user.email} with status ${mappedStatus}.`);
  return savedSubscription;
}

export async function syncSuccessfulInvoice(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) throw new Error("Invoice is missing customer information.");

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) throw new Error("User not found for invoice.");

  const amount = (invoice.amount_paid ?? 0) / 100;

  const payment = await prisma.payment.upsert({
    where: {
      stripeInvoiceId: invoice.id
    },
    update: {
      amount,
      currency: invoice.currency?.toUpperCase() ?? "USD",
      status: PAYMENT_STATUSES.SUCCEEDED
    },
    create: {
      userId: user.id,
      stripeInvoiceId: invoice.id,
      amount,
      currency: invoice.currency?.toUpperCase() ?? "USD",
      status: PAYMENT_STATUSES.SUCCEEDED
    }
  });

  if (user.selectedCharityId) {
    const contributionAmount = Number((amount * (Number(user.charityPercentage) / 100)).toFixed(2));
    await prisma.charityContribution.create({
      data: {
        userId: user.id,
        charityId: user.selectedCharityId,
        paymentId: payment.id,
        amount: contributionAmount,
        percentage: user.charityPercentage
      }
    });
  }

  notify("success", `Payment succeeded for ${user.email}: ${amount}`);
  return payment;
}

export async function getSubscriptionSummary(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  if (!subscription) {
    return {
      status: SUBSCRIPTION_STATUSES.EXPIRED,
      plan: null,
      currentPeriodEnd: null
    };
  }

  return {
    status: subscription.status,
    plan: subscription.plan,
    currentPeriodEnd: subscription.currentPeriodEnd
  };
}

export async function updateSubscriptionByAdmin(subscriptionId: string, input: {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      plan: input.plan,
      status: input.status,
      currentPeriodStart: input.currentPeriodStart ? new Date(input.currentPeriodStart) : null,
      currentPeriodEnd: input.currentPeriodEnd ? new Date(input.currentPeriodEnd) : null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd
    }
  });
}
