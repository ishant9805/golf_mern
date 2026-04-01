import { SUBSCRIPTION_STATUSES, type UserRole } from "@/server/domain/constants";
import { prisma } from "@/server/lib/prisma";
import { createSessionToken, hashPassword, setSessionCookie, verifyPassword } from "@/server/lib/auth";
import type { SafeUser, SessionUser } from "@/types";

function toSafeUser(user: {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  charityPercentage: { toNumber(): number } | number;
  selectedCharityId: string | null;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    charityPercentage:
      typeof user.charityPercentage === "number"
        ? user.charityPercentage
        : user.charityPercentage.toNumber(),
    selectedCharityId: user.selectedCharityId
  };
}

export async function signupUser(input: {
  fullName: string;
  email: string;
  password: string;
  selectedCharityId: string;
  charityPercentage: number;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });

  if (existing) {
    throw new Error("An account already exists with that email.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      passwordHash,
      selectedCharityId: input.selectedCharityId,
      charityPercentage: input.charityPercentage
    }
  });

  const safeUser = toSafeUser(user);
  const token = await createSessionToken(safeUser);
  await setSessionCookie(token);
  return safeUser;
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  const safeUser = toSafeUser(user);
  const token = await createSessionToken(safeUser);
  await setSessionCookie(token);
  return safeUser;
}

export async function getSessionUserById(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!user) return null;

  const latestSubscription = user.subscriptions[0] ?? null;
  const subscriptionStatus = latestSubscription?.status ?? null;

  return {
    ...toSafeUser(user),
    subscriptionStatus,
    hasActiveSubscription: subscriptionStatus === SUBSCRIPTION_STATUSES.ACTIVE
  };
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      selectedCharity: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      selectedCharity: true,
      subscriptions: {
        orderBy: { createdAt: "desc" }
      },
      scores: {
        orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }]
      },
      winners: {
        orderBy: { createdAt: "desc" },
        include: { draw: true }
      },
      payments: {
        orderBy: { createdAt: "desc" }
      }
    }
  });
}

export async function updateUserProfileByAdmin(userId: string, input: {
  fullName: string;
  email: string;
  role: UserRole;
  selectedCharityId: string | null;
  charityPercentage: number;
}) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      role: input.role,
      selectedCharityId: input.selectedCharityId,
      charityPercentage: input.charityPercentage
    },
    include: {
      selectedCharity: true,
      subscriptions: {
        orderBy: { createdAt: "desc" }
      },
      scores: {
        orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }]
      }
    }
  });
}
