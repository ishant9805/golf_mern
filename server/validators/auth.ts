import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  selectedCharityId: z.string().cuid(),
  charityPercentage: z.number().min(10).max(100)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});
