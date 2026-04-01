import { requireAdmin } from "@/server/api/guards";
import { charitySchema } from "@/server/validators/charity";
import { createCharity, listCharities } from "@/server/services";
import { fail, handleServerError, ok } from "@/server/lib/api";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    return ok(await listCharities());
  } catch (error) {
    return handleServerError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const parsed = charitySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid charity request.");
    }

    const charity = await createCharity(parsed.data);
    return ok(charity, { status: 201 });
  } catch (error) {
    return handleServerError(error);
  }
}
