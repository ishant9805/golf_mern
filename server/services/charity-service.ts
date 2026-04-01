import { prisma } from "@/server/lib/prisma";

export async function listCharities() {
  return prisma.charity.findMany({
    orderBy: [{ featured: "desc" }, { name: "asc" }]
  });
}

export async function getCharityBySlug(slug: string) {
  return prisma.charity.findUnique({
    where: { slug }
  });
}

export async function createCharity(input: {
  name: string;
  slug: string;
  description: string;
  mission: string;
  imageUrl?: string;
  location?: string;
  featured?: boolean;
  upcomingEvents?: Array<{ title: string; date: string; location: string }>;
}) {
  return prisma.charity.create({
    data: {
      ...input,
      imageUrl: input.imageUrl || null,
      location: input.location || null,
      upcomingEvents: input.upcomingEvents ?? []
    }
  });
}

export async function updateCharity(
  charityId: string,
  input: {
    name: string;
    slug: string;
    description: string;
    mission: string;
    imageUrl?: string;
    location?: string;
    featured?: boolean;
    upcomingEvents?: Array<{ title: string; date: string; location: string }>;
  }
) {
  return prisma.charity.update({
    where: { id: charityId },
    data: {
      ...input,
      imageUrl: input.imageUrl || null,
      location: input.location || null,
      upcomingEvents: input.upcomingEvents ?? []
    }
  });
}

export async function deleteCharity(charityId: string) {
  return prisma.charity.delete({
    where: { id: charityId }
  });
}
