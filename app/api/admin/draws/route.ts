import { requireAdmin } from "@/server/api/guards";
import { drawConfigSchema } from "@/server/validators/draw";
import { createOrSimulateDraw, listPublishedDraws } from "@/server/services";
import { fail, handleServerError, ok } from "@/server/lib/api";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    return ok(await listPublishedDraws());
  } catch (error) {
    return handleServerError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = drawConfigSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid draw payload.");
    return ok(
      await createOrSimulateDraw({
        monthKey: parsed.data.monthKey,
        title: parsed.data.title,
        drawType: parsed.data.drawType,
        notes: parsed.data.notes
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
