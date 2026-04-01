import { z } from "zod";

export const scoreInputSchema = z.object({
  value: z.number().int().min(1).max(45),
  playedAt: z.string().datetime()
});
