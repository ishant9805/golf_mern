import { fail, handleServerError, ok } from "@/server/lib/api";
import { getCharityBySlug } from "@/server/services";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const charity = await getCharityBySlug(slug);
    if (!charity) return fail("Charity not found.", 404);
    return ok(charity);
  } catch (error) {
    return handleServerError(error);
  }
}
