import { requireAdmin } from "@/server/api/guards";
import { fail, handleServerError, ok } from "@/server/lib/api";
import { reviewWinner } from "@/server/services";
import { winnerReviewSchema } from "@/server/validators/winner";

export async function POST(request: Request, context: { params: Promise<{ winnerId: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = winnerReviewSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid review payload.");
    const { winnerId } = await context.params;
    return ok(await reviewWinner(winnerId, parsed.data.verificationStatus));
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
