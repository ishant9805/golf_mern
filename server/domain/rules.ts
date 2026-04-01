import { DRAW_TYPES, type DrawType } from "@/server/domain/constants";
import type { DrawNumbers } from "@/types";

export const SCORE_LIMIT = 5;
export const SCORE_RANGE = {
  min: 1,
  max: 45
} as const;

export function enforceRollingScores<T extends { playedAt: Date; createdAt: Date }>(scores: T[]) {
  const ordered = [...scores].sort((a, b) => {
    const playedDiff = b.playedAt.getTime() - a.playedAt.getTime();
    if (playedDiff !== 0) return playedDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return ordered.slice(0, SCORE_LIMIT);
}

export function hasDuplicateScore(
  scores: Array<{ value: number; playedAt: Date }>,
  candidate: { value: number; playedAt: Date },
  ignoreId?: string,
  getId?: (score: { value: number; playedAt: Date }) => string | undefined
) {
  return scores.some((score) => {
    if (ignoreId && getId?.(score) === ignoreId) return false;
    return score.value === candidate.value && score.playedAt.getTime() === candidate.playedAt.getTime();
  });
}

export function generateRandomDrawNumbers(random = Math.random): DrawNumbers {
  const pool = Array.from({ length: SCORE_RANGE.max }, (_, index) => index + 1);
  const selected: number[] = [];

  while (selected.length < 5) {
    const index = Math.floor(random() * pool.length);
    selected.push(pool[index]);
    pool.splice(index, 1);
  }

  return selected.sort((a, b) => a - b) as DrawNumbers;
}

export function generateWeightedDrawNumbers(values: number[]): DrawNumbers {
  const frequencies = new Map<number, number>();
  for (const value of values) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }

  return Array.from({ length: SCORE_RANGE.max }, (_, index) => index + 1)
    .map((value) => ({
      value,
      weight: (frequencies.get(value) ?? 0) + 1
    }))
    .sort((a, b) => b.weight - a.weight || a.value - b.value)
    .slice(0, 5)
    .map((item) => item.value)
    .sort((a, b) => a - b) as DrawNumbers;
}

export function pickDrawNumbers(drawType: DrawType, values: number[]) {
  return drawType === DRAW_TYPES.RANDOM
    ? generateRandomDrawNumbers()
    : generateWeightedDrawNumbers(values);
}

export function countMatches(scores: number[], drawNumbers: DrawNumbers) {
  const matchedNumbers = scores.filter((score) => drawNumbers.includes(score)).sort((a, b) => a - b);
  return {
    matchedCount: matchedNumbers.length,
    matchedNumbers
  };
}

export function calculatePrizeDistribution({
  activeSubscriptions,
  planPrice,
  previousJackpotRollover,
  fiveMatchWinners,
  fourMatchWinners,
  threeMatchWinners
}: {
  activeSubscriptions: number;
  planPrice: number;
  previousJackpotRollover: number;
  fiveMatchWinners: number;
  fourMatchWinners: number;
  threeMatchWinners: number;
}) {
  const prizePoolTotal = Number((activeSubscriptions * planPrice).toFixed(2));
  const jackpotBase = Number((prizePoolTotal * 0.4 + previousJackpotRollover).toFixed(2));
  const fourMatchPool = Number((prizePoolTotal * 0.35).toFixed(2));
  const threeMatchPool = Number((prizePoolTotal * 0.25).toFixed(2));

  return {
    prizePoolTotal,
    jackpotRollover: fiveMatchWinners === 0 ? jackpotBase : 0,
    tiers: {
      5: {
        total: jackpotBase,
        amountPerWinner: fiveMatchWinners > 0 ? Number((jackpotBase / fiveMatchWinners).toFixed(2)) : 0
      },
      4: {
        total: fourMatchPool,
        amountPerWinner: fourMatchWinners > 0 ? Number((fourMatchPool / fourMatchWinners).toFixed(2)) : 0
      },
      3: {
        total: threeMatchPool,
        amountPerWinner: threeMatchWinners > 0 ? Number((threeMatchPool / threeMatchWinners).toFixed(2)) : 0
      }
    }
  };
}

export function calculateCharityContribution(paymentAmount: number, charityPercentage: number) {
  const safePercentage = Math.max(10, Math.min(100, charityPercentage));
  return Number((paymentAmount * (safePercentage / 100)).toFixed(2));
}
