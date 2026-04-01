import { requireAdmin } from "@/server/api/guards";
import { fail, handleServerError, ok } from "@/server/lib/api";
import { updateScoreByAdmin } from "@/server/services";
import { scoreInputSchema } from "@/server/validators/score";

export async function PATCH(request: Request, context: { params: Promise<{ scoreId: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = scoreInputSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid score payload.");
    const { scoreId } = await context.params;
    return ok(await updateScoreByAdmin(scoreId, parsed.data));
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
