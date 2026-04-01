import { SUBSCRIPTION_STATUSES, USER_ROLES } from "@/server/domain/constants";
import { fail } from "@/server/lib/api";
import { getSessionToken, verifySessionToken } from "@/server/lib/auth";
import { getSessionUserById } from "@/server/services/auth-service";

export async function requireSession() {
  const token = await getSessionToken();
  if (!token) {
    return { error: fail("Authentication required.", 401) };
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await getSessionUserById(payload.id);
    if (!user) {
      return { error: fail("Authentication required.", 401) };
    }
    return { user };
  } catch {
    return { error: fail("Invalid session.", 401) };
  }
}

export async function requireAdmin() {
  const result = await requireSession();
  if ("error" in result) return result;
  if (result.user.role !== USER_ROLES.ADMIN) {
    return { error: fail("Admin access required.", 403) };
  }
  return result;
}

export async function requireActiveSubscriber() {
  const result = await requireSession();
  if ("error" in result) return result;
  if (
    result.user.subscriptionStatus !== SUBSCRIPTION_STATUSES.ACTIVE &&
    result.user.role !== USER_ROLES.ADMIN
  ) {
    return { error: fail("An active subscription is required.", 403) };
  }
  return result;
}
