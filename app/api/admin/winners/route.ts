import { requireAdmin } from "@/server/api/guards";
import { handleServerError, ok } from "@/server/lib/api";
import { listWinners } from "@/server/services";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    return ok(await listWinners());
  } catch (error) {
    return handleServerError(error);
  }
}
