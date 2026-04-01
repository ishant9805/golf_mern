import { requireActiveSubscriber } from "@/server/api/guards";
import { fail, handleServerError, ok } from "@/server/lib/api";
import { uploadWinnerProof } from "@/server/services";

export async function POST(request: Request, context: { params: Promise<{ winnerId: string }> }) {
  try {
    const auth = await requireActiveSubscriber();
    if ("error" in auth) return auth.error;
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return fail("Proof image is required.");
    }
    const { winnerId } = await context.params;
    return ok(await uploadWinnerProof(winnerId, file));
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return handleServerError(error);
  }
}
