import { clearSessionCookie } from "@/server/lib/auth";
import { ok, handleServerError } from "@/server/lib/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ message: "Logged out." });
  } catch (error) {
    return handleServerError(error);
  }
}
