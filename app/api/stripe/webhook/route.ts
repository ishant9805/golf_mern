import Stripe from "stripe";
import { headers } from "next/headers";
import { env } from "@/server/lib/env";
import { fail, ok } from "@/server/lib/api";
import { stripe } from "@/server/lib/stripe";
import { syncSubscriptionFromStripe, syncSuccessfulInvoice } from "@/server/services";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return fail("Missing Stripe signature.", 400);
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return fail(`Webhook error: ${(error as Error).message}`, 400);
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscriptionFromStripe(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_succeeded":
      await syncSuccessfulInvoice(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }

  return ok({ received: true });
}
