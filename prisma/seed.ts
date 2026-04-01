import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.winner.deleteMany();
  await prisma.drawResult.deleteMany();
  await prisma.draw.deleteMany();
  await prisma.charityContribution.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.score.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.charity.deleteMany();

  const charities = await prisma.$transaction([
    prisma.charity.create({
      data: {
        name: "Youth Fairway Futures",
        slug: "youth-fairway-futures",
        description: "Opening access to golf and mentorship programs for underrepresented young players.",
        mission: "Fund coaching, transport, and equipment for youth golf development.",
        location: "London, UK",
        featured: true,
        upcomingEvents: [
          { title: "Spring Golf Day", date: "2026-05-15", location: "Manchester" }
        ]
      }
    }),
    prisma.charity.create({
      data: {
        name: "Green Course Recovery",
        slug: "green-course-recovery",
        description: "Restoring community green spaces and climate-resilient sporting grounds.",
        mission: "Support local environmental regeneration projects tied to sport and recreation.",
        location: "Dublin, Ireland",
        featured: false,
        upcomingEvents: [
          { title: "Community Grounds Week", date: "2026-06-03", location: "Dublin" }
        ]
      }
    })
  ]);

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: {
      fullName: "Admin Operator",
      email: "admin@golfcharity.test",
      passwordHash,
      role: "ADMIN",
      charityPercentage: 10,
      selectedCharityId: charities[0].id
    }
  });

  const subscriber = await prisma.user.create({
    data: {
      fullName: "Sophie Subscriber",
      email: "subscriber@golfcharity.test",
      passwordHash,
      role: "SUBSCRIBER",
      charityPercentage: 20,
      selectedCharityId: charities[1].id,
      stripeCustomerId: "cus_demo_subscriber"
    }
  });

  await prisma.subscription.create({
    data: {
      userId: subscriber.id,
      plan: "MONTHLY",
      status: "ACTIVE",
      stripeSubscriptionId: "sub_demo_active",
      stripePriceId: "price_demo_monthly",
      currentPeriodStart: new Date("2026-03-01T00:00:00.000Z"),
      currentPeriodEnd: new Date("2026-04-01T00:00:00.000Z")
    }
  });

  await prisma.score.createMany({
    data: [
      { userId: subscriber.id, value: 12, playedAt: new Date("2026-03-29T00:00:00.000Z") },
      { userId: subscriber.id, value: 18, playedAt: new Date("2026-03-22T00:00:00.000Z") },
      { userId: subscriber.id, value: 22, playedAt: new Date("2026-03-15T00:00:00.000Z") },
      { userId: subscriber.id, value: 31, playedAt: new Date("2026-03-08T00:00:00.000Z") },
      { userId: subscriber.id, value: 41, playedAt: new Date("2026-03-01T00:00:00.000Z") }
    ]
  });

  const payment = await prisma.payment.create({
    data: {
      userId: subscriber.id,
      stripeInvoiceId: "in_demo_paid",
      amount: 29,
      currency: "USD",
      status: "SUCCEEDED"
    }
  });

  await prisma.charityContribution.create({
    data: {
      userId: subscriber.id,
      charityId: charities[1].id,
      paymentId: payment.id,
      amount: 5.8,
      percentage: 20
    }
  });

  const draw = await prisma.draw.create({
    data: {
      monthKey: "2026-03",
      title: "March Impact Draw",
      drawType: "RANDOM",
      status: "PUBLISHED",
      generatedNumbers: [12, 18, 22, 31, 41],
      simulationNumbers: [12, 18, 22, 31, 41],
      prizePoolTotal: 290,
      jackpotRollover: 0,
      publishedAt: new Date("2026-03-31T10:00:00.000Z")
    }
  });

  await prisma.drawResult.createMany({
    data: [
      { drawId: draw.id, tier: 5, winnersCount: 1, prizeAmount: 116, amountPerWinner: 116, rolloverApplied: 0 },
      { drawId: draw.id, tier: 4, winnersCount: 0, prizeAmount: 101.5, amountPerWinner: 0, rolloverApplied: 0 },
      { drawId: draw.id, tier: 3, winnersCount: 0, prizeAmount: 72.5, amountPerWinner: 0, rolloverApplied: 0 }
    ]
  });

  await prisma.winner.create({
    data: {
      userId: subscriber.id,
      drawId: draw.id,
      matchedCount: 5,
      matchedNumbers: [12, 18, 22, 31, 41],
      prizeAmount: 116,
      verificationStatus: "PENDING",
      payoutStatus: "PENDING"
    }
  });

  console.log("Seed complete.");
  console.log({
    adminEmail: admin.email,
    subscriberEmail: subscriber.email,
    password: "Password123!"
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
