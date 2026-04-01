import {
  PAYOUT_STATUSES,
  WINNER_VERIFICATION_STATUSES,
  type PayoutStatus,
  type WinnerVerificationStatus
} from "@/server/domain/constants";
import { prisma } from "@/server/lib/prisma";
import { env } from "@/server/lib/env";
import { storageClient } from "@/server/lib/supabase";

export async function listWinners() {
  return prisma.winner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      draw: true
    }
  });
}

export async function uploadWinnerProof(
  winnerId: string,
  file: File
) {
  const winner = await prisma.winner.findUnique({
    where: { id: winnerId }
  });

  if (!winner) {
    throw new Error("Winner record not found.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const filePath = `winner-proofs/${winnerId}-${Date.now()}-${file.name}`;

  const { error } = await storageClient.from(env.SUPABASE_STORAGE_BUCKET).upload(filePath, arrayBuffer, {
    contentType: file.type || "image/png",
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  return prisma.winner.update({
    where: { id: winnerId },
    data: {
      proofImagePath: filePath,
      verificationStatus: WINNER_VERIFICATION_STATUSES.PENDING
    }
  });
}

export async function reviewWinner(winnerId: string, verificationStatus: WinnerVerificationStatus) {
  return prisma.winner.update({
    where: { id: winnerId },
    data: {
      verificationStatus,
      reviewedAt: new Date(),
      payoutStatus: PAYOUT_STATUSES.PENDING
    }
  });
}

export async function updatePayoutStatus(winnerId: string, payoutStatus: PayoutStatus) {
  return prisma.winner.update({
    where: { id: winnerId },
    data: { payoutStatus }
  });
}
