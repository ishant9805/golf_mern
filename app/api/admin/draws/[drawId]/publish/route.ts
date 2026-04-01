import { requireAdmin } from "@/server/api/guards";
import { fail, handleServerError, ok } from "@/server/lib/api";
import { publishDraw } from "@/server/services";

export async function POST(_: Request, context: { params: Promise<{ drawId: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const { drawId } = await context.params;
    return ok(await publishDraw(drawId));
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
