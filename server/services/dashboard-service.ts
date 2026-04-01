import { prisma } from "@/server/lib/prisma";
import { getSubscriptionSummary } from "@/server/services/billing-service";
import { listScores } from "@/server/services/score-service";

export async function getSubscriberDashboard(userId: string) {
  const [subscription, scores, user, winners, contributions, payments, drawCount] = await Promise.all([
    getSubscriptionSummary(userId),
    listScores(userId),
    prisma.user.findUnique({
      where: { id: userId },
      include: { selectedCharity: true }
    }),
    prisma.winner.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { draw: true }
    }),
    prisma.charityContribution.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { charity: true }
    }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    }),
    prisma.draw.count({
      where: { status: "PUBLISHED" }
    })
  ]);

  return {
    subscription,
    scores,
    charity: user?.selectedCharity,
    charityPercentage: Number(user?.charityPercentage ?? 10),
    participationSummary: {
      drawsEntered: drawCount,
      upcomingDraw: "Monthly"
    },
    winnings: winners,
    contributions,
    payments
  };
}

export async function getAdminDashboard() {
  const [
    totalUsers,
    activeSubscriptions,
    charities,
    totalPrizePool,
    totalContributions,
    winnersPending,
    draws,
    publishedDraws,
    randomDraws,
    algorithmicDraws,
    totalWinners
  ] =
    await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: { status: "ACTIVE" }
      }),
      prisma.charity.count(),
      prisma.draw.aggregate({
        _sum: { prizePoolTotal: true }
      }),
      prisma.charityContribution.aggregate({
        _sum: { amount: true }
      }),
      prisma.winner.count({
        where: { verificationStatus: "PENDING" }
      }),
      prisma.draw.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { results: true }
      }),
      prisma.draw.count({
        where: { status: "PUBLISHED" }
      }),
      prisma.draw.count({
        where: { drawType: "RANDOM" }
      }),
      prisma.draw.count({
        where: { drawType: "ALGORITHMIC" }
      }),
      prisma.winner.count()
    ]);

  return {
    totalUsers,
    activeSubscriptions,
    charities,
    totalPrizePool: Number(totalPrizePool._sum.prizePoolTotal ?? 0),
    totalContributions: Number(totalContributions._sum.amount ?? 0),
    winnersPending,
    recentDraws: draws,
    drawStatistics: {
      publishedDraws,
      randomDraws,
      algorithmicDraws,
      totalWinners
    }
  };
}
