import { signupSchema } from "@/server/validators/auth";
import { handleServerError, ok, fail } from "@/server/lib/api";
import { signupUser } from "@/server/services";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid signup request.");
    }

    const user = await signupUser(parsed.data);
    return ok(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return fail(error.message, 400);
    }
    return handleServerError(error);
  }
}
