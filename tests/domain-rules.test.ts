import { describe, expect, it } from "vitest";
import {
  calculateCharityContribution,
  calculatePrizeDistribution,
  countMatches,
  enforceRollingScores,
  generateRandomDrawNumbers,
  generateWeightedDrawNumbers
} from "@/server/domain/rules";

describe("score rules", () => {
  it("keeps only the latest five scores", () => {
    const scores = Array.from({ length: 6 }, (_, index) => ({
      playedAt: new Date(`2026-03-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
      createdAt: new Date(`2026-03-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`)
    }));

    const kept = enforceRollingScores(scores);
    expect(kept).toHaveLength(5);
    expect(kept[0].playedAt.toISOString()).toContain("2026-03-06");
    expect(kept[4].playedAt.toISOString()).toContain("2026-03-02");
  });
});

describe("draw rules", () => {
  it("creates five unique random numbers", () => {
    const numbers = generateRandomDrawNumbers(() => 0.1);
    expect(numbers).toHaveLength(5);
    expect(new Set(numbers).size).toBe(5);
  });

  it("weights the most frequent scores first", () => {
    const numbers = generateWeightedDrawNumbers([12, 12, 12, 7, 7, 18, 30, 45]);
    expect(numbers).toContain(12);
    expect(numbers).toContain(7);
  });

  it("counts 3, 4 and 5 matches correctly", () => {
    const result = countMatches([2, 7, 12, 18, 40], [2, 7, 12, 18, 24]);
    expect(result.matchedCount).toBe(4);
    expect(result.matchedNumbers).toEqual([2, 7, 12, 18]);
  });
});

describe("prize pool rules", () => {
  it("rolls jackpot forward when there is no 5-match winner", () => {
    const distribution = calculatePrizeDistribution({
      activeSubscriptions: 10,
      planPrice: 29,
      previousJackpotRollover: 100,
      fiveMatchWinners: 0,
      fourMatchWinners: 2,
      threeMatchWinners: 4
    });

    expect(distribution.prizePoolTotal).toBe(290);
    expect(distribution.jackpotRollover).toBe(216);
    expect(distribution.tiers[4].amountPerWinner).toBe(50.75);
    expect(distribution.tiers[3].amountPerWinner).toBe(18.13);
  });

  it("calculates charity contributions with a minimum of ten percent", () => {
    expect(calculateCharityContribution(29, 5)).toBe(2.9);
    expect(calculateCharityContribution(29, 25)).toBe(7.25);
  });
});
