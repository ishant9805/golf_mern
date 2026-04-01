import { z } from "zod";
import { DRAW_TYPES } from "@/server/domain/constants";

export const drawConfigSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  title: z.string().min(3).max(120),
  drawType: z.enum([DRAW_TYPES.RANDOM, DRAW_TYPES.ALGORITHMIC]),
  notes: z.string().max(500).optional()
});
