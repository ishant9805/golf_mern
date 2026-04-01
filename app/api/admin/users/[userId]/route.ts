import { requireAdmin } from "@/server/api/guards";
import { fail, handleServerError, ok } from "@/server/lib/api";
import { updateUserProfileByAdmin } from "@/server/services";
import { adminUserUpdateSchema } from "@/server/validators/admin";

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const parsed = adminUserUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid user payload.");
    const { userId } = await context.params;
    return ok(await updateUserProfileByAdmin(userId, parsed.data));
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
