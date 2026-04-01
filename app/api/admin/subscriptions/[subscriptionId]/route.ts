import { requireAdmin } from "@/server/api/guards";
import { fail, handleServerError, ok } from "@/server/lib/api";
import { updateSubscriptionByAdmin } from "@/server/services";
import { adminSubscriptionUpdateSchema } from "@/server/validators/admin";

export async function PATCH(request: Request, context: { params: Promise<{ subscriptionId: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = adminSubscriptionUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid subscription payload.");
    const { subscriptionId } = await context.params;
    return ok(await updateSubscriptionByAdmin(subscriptionId, parsed.data));
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
