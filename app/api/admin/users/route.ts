import { requireAdmin } from "@/server/api/guards";
import { ok, handleServerError } from "@/server/lib/api";
import { getAdminUsers } from "@/server/services";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    return ok(await getAdminUsers());
  } catch (error) {
    return handleServerError(error);
  }
}
