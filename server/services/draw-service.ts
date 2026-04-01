import { DRAW_STATUSES, DRAW_TYPES, type DrawType } from "@/server/domain/constants";
import { prisma } from "@/server/lib/prisma";
import { safeJsonParse } from "@/server/lib/utils";
import type { DrawNumbers } from "@/types";

const SCORE_MIN = 1;
const SCORE_MAX = 45;
const DRAW_SIZE = 5;

function uniqueSorted(numbers: number[]): DrawNumbers {
  const values = [...new Set(numbers)].sort((a, b) => a - b).slice(0, DRAW_SIZE);
  if (values.length !== DRAW_SIZE) {
    throw new Error("Draw generation did not produce enough unique numbers.");
  }
  return values as DrawNumbers;
}

export function generateRandomDrawNumbers(): DrawNumbers {
  const pool = Array.from({ length: SCORE_MAX }, (_, index) => index + SCORE_MIN);
  const chosen: number[] = [];

  while (chosen.length < DRAW_SIZE) {
    const index = Math.floor(Math.random() * pool.length);
    chosen.push(pool[index]);
    pool.splice(index, 1);
  }

  return uniqueSorted(chosen);
}

export function generateWeightedDrawNumbers(values: number[]): DrawNumbers {
  const frequencies = new Map<number, number>();
  for (const value of values) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }

  const weightedPool = Array.from({ length: SCORE_MAX }, (_, index) => index + SCORE_MIN)
    .map((value) => ({
      value,
      weight: (frequencies.get(value) ?? 0) + 1
    }))
    .sort((a, b) => b.weight - a.weight || a.value - b.value);

  const chosen = weightedPool.slice(0, DRAW_SIZE).map((entry) => entry.value);
  return uniqueSorted(chosen);
}

async function getEligibleScores() {
  const users = await prisma.user.findMany({
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        take: 1
      },
      scores: {
        orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }],
        take: 5
      }
    }
  });

  return users.filter((user: any) => user.subscriptions.length > 0 && user.scores.length > 0);
}

export async function previewDraw(drawType: DrawType) {
  const eligibleUsers = await getEligibleScores();
  const scoreValues = eligibleUsers.flatMap((user: any) => user.scores.map((score: any) => score.value));
  const generatedNumbers =
    drawType === DRAW_TYPES.RANDOM
      ? generateRandomDrawNumbers()
      : generateWeightedDrawNumbers(scoreValues);

  return {
    drawType,
    generatedNumbers,
    eligibleUsers: eligibleUsers.length
  };
}

function countMatches(scores: number[], drawNumbers: DrawNumbers) {
  const matched = scores.filter((value) => drawNumbers.includes(value));
  return {
    matchedCount: matched.length,
    matchedNumbers: matched.sort((a, b) => a - b)
  };
}

export async function createOrSimulateDraw(input: {
  monthKey: string;
  title: string;
  drawType: DrawType;
  notes?: string;
}) {
  const preview = await previewDraw(input.drawType);
  return prisma.draw.upsert({
    where: { monthKey: input.monthKey },
    update: {
      title: input.title,
      drawType: input.drawType,
      simulationNumbers: preview.generatedNumbers,
      status: DRAW_STATUSES.SIMULATED,
      notes: input.notes
    },
    create: {
      monthKey: input.monthKey,
      title: input.title,
      drawType: input.drawType,
      generatedNumbers: preview.generatedNumbers,
      simulationNumbers: preview.generatedNumbers,
      prizePoolTotal: 0,
      jackpotRollover: 0,
      status: DRAW_STATUSES.SIMULATED,
      notes: input.notes
    }
  });
}

export async function publishDraw(drawId: string) {
  const draw = await prisma.draw.findUnique({
    where: { id: drawId }
  });

  if (!draw) throw new Error("Draw not found.");

  const eligibleUsers = await getEligibleScores();
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: "ACTIVE" }
  });

  const subscriptionRevenue = activeSubscriptions * 29;
  const previousPublishedDraw = await prisma.draw.findFirst({
    where: { status: DRAW_STATUSES.PUBLISHED },
    orderBy: { publishedAt: "desc" }
  });

  const previousJackpotRollover = previousPublishedDraw
    ? Number(previousPublishedDraw.jackpotRollover)
    : 0;

  const generatedNumbers = (
    draw.simulationNumbers
      ? safeJsonParse<DrawNumbers>(draw.simulationNumbers, generateRandomDrawNumbers())
      : safeJsonParse<DrawNumbers>(draw.generatedNumbers, generateRandomDrawNumbers())
  ) as DrawNumbers;

  const winnerCandidates = eligibleUsers
    .map((user: any) => {
      const scoreValues = user.scores.map((score: any) => score.value);
      const { matchedCount, matchedNumbers } = countMatches(scoreValues, generatedNumbers);
      return {
        user,
        matchedCount,
        matchedNumbers
      };
    })
    .filter((entry: any) => entry.matchedCount >= 3);

  const tierShares = {
    5: 0.4,
    4: 0.35,
    3: 0.25
  } as const;

  const fiveMatchWinners = winnerCandidates.filter((item: any) => item.matchedCount === 5);
  const prizePoolTotal = subscriptionRevenue;
  const newJackpotBase = Number((prizePoolTotal * tierShares[5] + previousJackpotRollover).toFixed(2));
  const jackpotRollover = fiveMatchWinners.length === 0 ? newJackpotBase : 0;

  await prisma.$transaction(async (tx: any) => {
    await tx.drawResult.deleteMany({
      where: { drawId }
    });
    await tx.winner.deleteMany({
      where: { drawId }
    });

    const tierResults: Array<{ tier: 3 | 4 | 5; amount: number; winnersCount: number; amountPerWinner: number; rolloverApplied: number }> = [
      {
        tier: 5,
        amount: newJackpotBase,
        winnersCount: fiveMatchWinners.length,
        amountPerWinner: fiveMatchWinners.length > 0 ? Number((newJackpotBase / fiveMatchWinners.length).toFixed(2)) : 0,
        rolloverApplied: fiveMatchWinners.length === 0 ? newJackpotBase : 0
      },
      {
        tier: 4,
        amount: Number((prizePoolTotal * tierShares[4]).toFixed(2)),
        winnersCount: winnerCandidates.filter((item: any) => item.matchedCount === 4).length,
        amountPerWinner: 0,
        rolloverApplied: 0
      },
      {
        tier: 3,
        amount: Number((prizePoolTotal * tierShares[3]).toFixed(2)),
        winnersCount: winnerCandidates.filter((item: any) => item.matchedCount === 3).length,
        amountPerWinner: 0,
        rolloverApplied: 0
      }
    ];

    tierResults[1].amountPerWinner =
      tierResults[1].winnersCount > 0 ? Number((tierResults[1].amount / tierResults[1].winnersCount).toFixed(2)) : 0;
    tierResults[2].amountPerWinner =
      tierResults[2].winnersCount > 0 ? Number((tierResults[2].amount / tierResults[2].winnersCount).toFixed(2)) : 0;

    await tx.draw.update({
      where: { id: drawId },
      data: {
        generatedNumbers,
        prizePoolTotal,
        jackpotRollover,
        status: DRAW_STATUSES.PUBLISHED,
        publishedAt: new Date()
      }
    });

    for (const result of tierResults) {
      await tx.drawResult.create({
        data: {
          drawId,
          tier: result.tier,
          winnersCount: result.winnersCount,
          prizeAmount: result.amount,
          amountPerWinner: result.amountPerWinner,
          rolloverApplied: result.rolloverApplied
        }
      });
    }

    for (const candidate of winnerCandidates) {
      const tier = candidate.matchedCount as 3 | 4 | 5;
      const amountPerWinner = tierResults.find((item: any) => item.tier === tier)?.amountPerWinner ?? 0;

      await tx.winner.create({
        data: {
          userId: candidate.user.id,
          drawId,
          matchedCount: candidate.matchedCount,
          matchedNumbers: candidate.matchedNumbers,
          prizeAmount: amountPerWinner
        }
      });
    }
  });

  return prisma.draw.findUnique({
    where: { id: drawId },
    include: {
      results: true,
      winners: {
        include: {
          user: true
        }
      }
    }
  });
}

export async function listPublishedDraws() {
  return prisma.draw.findMany({
    where: { status: DRAW_STATUSES.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    include: {
      results: true
    }
  });
}
