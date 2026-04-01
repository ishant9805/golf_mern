import { handleServerError, ok } from "@/server/lib/api";
import { requireSession } from "@/server/api/guards";

export async function GET() {
  try {
    const result = await requireSession();
    if ("error" in result) return result.error;
    return ok(result.user);
  } catch (error) {
    return handleServerError(error);
  }
}
