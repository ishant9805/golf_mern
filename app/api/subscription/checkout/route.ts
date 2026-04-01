import { fail, handleServerError, ok } from "@/server/lib/api";
import { requireSession } from "@/server/api/guards";
import { checkoutSchema } from "@/server/validators/billing";
import { createCheckoutSession } from "@/server/services";

export async function POST(request: Request) {
  try {
    const auth = await requireSession();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid plan.");
    const session = await createCheckoutSession(auth.user.id, parsed.data.plan);
    return ok({ url: session.url, sessionId: session.id });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
