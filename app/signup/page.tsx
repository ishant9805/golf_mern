import { redirect } from "next/navigation";
import { AuthForm } from "@/components/forms/auth-form";
import { getSessionToken, verifySessionToken } from "@/server/lib/auth";
import { listCharities } from "@/server/services";

export default async function SignupPage() {
  const token = await getSessionToken();
  if (token) {
    try {
      await verifySessionToken(token);
      redirect("/dashboard");
    } catch {
      // ignore invalid session
    }
  }

  const charities = await listCharities();
  return <AuthForm mode="signup" charities={charities} />;
}
