import { prisma } from "@/server/lib/prisma";

export async function listScores(userId: string) {
  return prisma.score.findMany({
    where: { userId },
    orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }]
  });
}

export async function createScore(userId: string, input: { value: number; playedAt: string }) {
  const playedAt = new Date(input.playedAt);

  const duplicate = await prisma.score.findFirst({
    where: {
      userId,
      value: input.value,
      playedAt
    }
  });

  if (duplicate) {
    throw new Error("This exact score entry already exists.");
  }

  const created = await prisma.score.create({
    data: {
      userId,
      value: input.value,
      playedAt
    }
  });

  const allScores = await prisma.score.findMany({
    where: { userId },
    orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }]
  });

  if (allScores.length > 5) {
    const oldest = [...allScores].sort((a, b) => {
      const playedDiff = a.playedAt.getTime() - b.playedAt.getTime();
      if (playedDiff !== 0) return playedDiff;
      return a.createdAt.getTime() - b.createdAt.getTime();
    })[0];

    await prisma.score.delete({
      where: { id: oldest.id }
    });
  }

  return created;
}

export async function updateScore(
  userId: string,
  scoreId: string,
  input: { value: number; playedAt: string }
) {
  const score = await prisma.score.findFirst({
    where: { id: scoreId, userId }
  });

  if (!score) {
    throw new Error("Score entry not found.");
  }

  const playedAt = new Date(input.playedAt);
  const duplicate = await prisma.score.findFirst({
    where: {
      userId,
      value: input.value,
      playedAt,
      NOT: { id: scoreId }
    }
  });

  if (duplicate) {
    throw new Error("A matching score entry already exists.");
  }

  return prisma.score.update({
    where: { id: scoreId },
    data: {
      value: input.value,
      playedAt
    }
  });
}

export async function deleteScore(userId: string, scoreId: string) {
  const score = await prisma.score.findFirst({
    where: { id: scoreId, userId }
  });

  if (!score) {
    throw new Error("Score entry not found.");
  }

  await prisma.score.delete({
    where: { id: scoreId }
  });
}

export async function updateScoreByAdmin(
  scoreId: string,
  input: { value: number; playedAt: string }
) {
  const score = await prisma.score.findUnique({
    where: { id: scoreId }
  });

  if (!score) {
    throw new Error("Score entry not found.");
  }

  const playedAt = new Date(input.playedAt);
  const duplicate = await prisma.score.findFirst({
    where: {
      userId: score.userId,
      value: input.value,
      playedAt,
      NOT: { id: scoreId }
    }
  });

  if (duplicate) {
    throw new Error("A matching score entry already exists.");
  }

  return prisma.score.update({
    where: { id: scoreId },
    data: {
      value: input.value,
      playedAt
    }
  });
}
