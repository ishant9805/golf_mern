import { handleServerError, ok, fail } from "@/server/lib/api";
import { requireActiveSubscriber } from "@/server/api/guards";
import { deleteScore, updateScore } from "@/server/services";
import { scoreInputSchema } from "@/server/validators/score";

export async function PATCH(request: Request, context: { params: Promise<{ scoreId: string }> }) {
  try {
    const auth = await requireActiveSubscriber();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = scoreInputSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid score.");
    const { scoreId } = await context.params;
    return ok(await updateScore(auth.user.id, scoreId, parsed.data));
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ scoreId: string }> }) {
  try {
    const auth = await requireActiveSubscriber();
    if ("error" in auth) return auth.error;
    const { scoreId } = await context.params;
    await deleteScore(auth.user.id, scoreId);
    return ok({ message: "Score deleted." });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
