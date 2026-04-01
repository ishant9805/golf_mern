import { handleServerError, ok } from "@/server/lib/api";
import { listPublishedDraws } from "@/server/services";

export async function GET() {
  try {
    return ok(await listPublishedDraws());
  } catch (error) {
    return handleServerError(error);
  }
}
