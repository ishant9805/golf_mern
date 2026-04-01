import { requireSession } from "@/server/api/guards";
import { handleServerError, ok } from "@/server/lib/api";
import { getSubscriberDashboard } from "@/server/services";

export async function GET() {
  try {
    const auth = await requireSession();
    if ("error" in auth) return auth.error;
    return ok(await getSubscriberDashboard(auth.user.id));
  } catch (error) {
    return handleServerError(error);
  }
}
