import { loginSchema } from "@/server/validators/auth";
import { handleServerError, ok, fail } from "@/server/lib/api";
import { loginUser } from "@/server/services";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid login request.");
    }

    const user = await loginUser(parsed.data);
    return ok(user);
  } catch (error) {
    if (error instanceof Error) {
      return fail(error.message, 400);
    }
    return handleServerError(error);
  }
}
