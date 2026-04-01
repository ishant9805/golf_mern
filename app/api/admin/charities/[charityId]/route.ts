import { requireAdmin } from "@/server/api/guards";
import { charitySchema } from "@/server/validators/charity";
import { deleteCharity, updateCharity } from "@/server/services";
import { fail, handleServerError, ok } from "@/server/lib/api";

export async function PATCH(request: Request, context: { params: Promise<{ charityId: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = charitySchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid charity request.");
    const { charityId } = await context.params;
    return ok(await updateCharity(charityId, parsed.data));
  } catch (error) {
    return handleServerError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ charityId: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const { charityId } = await context.params;
    await deleteCharity(charityId);
    return ok({ message: "Charity deleted." });
  } catch (error) {
    return handleServerError(error);
  }
}
