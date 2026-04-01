import { requireAdmin } from "@/server/api/guards";
import { fail, handleServerError, ok } from "@/server/lib/api";
import { updatePayoutStatus } from "@/server/services";
import { payoutUpdateSchema } from "@/server/validators/winner";

export async function POST(request: Request, context: { params: Promise<{ winnerId: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = payoutUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payout payload.");
    const { winnerId } = await context.params;
    return ok(await updatePayoutStatus(winnerId, parsed.data.payoutStatus));
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
