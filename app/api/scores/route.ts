import { handleServerError, ok, fail } from "@/server/lib/api";
import { requireActiveSubscriber } from "@/server/api/guards";
import { createScore, listScores } from "@/server/services";
import { scoreInputSchema } from "@/server/validators/score";

export async function GET() {
  try {
    const auth = await requireActiveSubscriber();
    if ("error" in auth) return auth.error;
    return ok(await listScores(auth.user.id));
  } catch (error) {
    return handleServerError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveSubscriber();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = scoreInputSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid score.");
    return ok(await createScore(auth.user.id, parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
