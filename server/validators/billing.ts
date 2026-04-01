import { z } from "zod";
import { SUBSCRIPTION_PLANS } from "@/server/domain/constants";

export const checkoutSchema = z.object({
  plan: z.enum([SUBSCRIPTION_PLANS.MONTHLY, SUBSCRIPTION_PLANS.YEARLY])
});
