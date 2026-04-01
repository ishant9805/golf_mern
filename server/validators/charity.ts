import { z } from "zod";

export const charitySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().min(20),
  mission: z.string().min(20),
  imageUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  upcomingEvents: z.array(
    z.object({
      title: z.string(),
      date: z.string(),
      location: z.string()
    })
  ).optional()
});
