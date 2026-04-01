import { redirect } from "next/navigation";
import { getSessionToken, verifySessionToken } from "@/server/lib/auth";
import { AuthForm } from "@/components/forms/auth-form";

export default async function LoginPage() {
  const token = await getSessionToken();
  if (token) {
    try {
      await verifySessionToken(token);
      redirect("/dashboard");
    } catch {
      // ignore invalid session
    }
  }

  return <AuthForm mode="login" />;
}
