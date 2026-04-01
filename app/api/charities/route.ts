import { handleServerError, ok } from "@/server/lib/api";
import { listCharities } from "@/server/services";

export async function GET() {
  try {
    const charities = await listCharities();
    return ok(charities);
  } catch (error) {
    return handleServerError(error);
  }
}
