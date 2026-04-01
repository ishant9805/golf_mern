import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { getSessionToken, verifySessionToken } from "@/server/lib/auth";
import { getSessionUserById, getSubscriberDashboard } from "@/server/services";
import { toCurrency } from "@/server/lib/utils";

export default async function DashboardPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const payload = await verifySessionToken(token);
  const session = await getSessionUserById(payload.id);
  if (!session) redirect("/login");

  const dashboard = await getSubscriberDashboard(session.id);
  const totalWon = dashboard.winnings.reduce((sum: number, item: any) => sum + Number(item.prizeAmount), 0);
  const contributionTotal = dashboard.contributions.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

  return (
    <DashboardShell
      title={`Welcome back, ${session.fullName.split(" ")[0]}`}
      subtitle="Manage your subscription, recent scores, charity impact, and draw participation from one subscriber workspace."
      actions={
        <form action="/api/auth/logout" method="post">
          <Button variant="ghost" type="submit">
            Log out
          </Button>
        </form>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Subscription"
          value={dashboard.subscription.status}
          detail={
            dashboard.subscription.currentPeriodEnd
              ? `Renews ${new Date(dashboard.subscription.currentPeriodEnd).toLocaleDateString()}`
              : "No active billing cycle"
          }
        />
        <MetricCard label="Draws entered" value={String(dashboard.participationSummary.drawsEntered)} detail="Published draws currently in the platform." />
        <MetricCard label="Total won" value={toCurrency(totalWon)} detail="Across all published draw results." />
        <MetricCard label="Charity impact" value={toCurrency(contributionTotal)} detail={`Your selected contribution rate is ${dashboard.charityPercentage}%.`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Latest scores</h2>
            <span className="text-sm text-[var(--muted)]">Rolling window of 5</span>
          </div>
          <div className="space-y-3">
            {dashboard.scores.map((score: any) => (
              <div key={score.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                <div>
                  <p className="font-bold">{score.value} Stableford</p>
                  <p className="text-sm text-[var(--muted)]">{new Date(score.playedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">Eligible</span>
              </div>
            ))}
            {dashboard.scores.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No scores yet. Use the score API to add your first round.</p>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-black">Participation and winnings</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Selected charity</p>
              <p className="mt-2 text-xl font-black">{dashboard.charity?.name ?? "Not set"}</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Notifications</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Mock notifications appear in the server console and through payment/draw state updates.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {dashboard.winnings.map((winner: any) => (
              <div key={winner.id} className="rounded-2xl bg-white/70 px-4 py-3">
                <p className="font-bold">
                  {winner.matchedCount} matches · {toCurrency(Number(winner.prizeAmount))}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {winner.draw.title} · verification {winner.verificationStatus} · payout {winner.payoutStatus}
                </p>
              </div>
            ))}
            {dashboard.winnings.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No winnings yet. Published results will appear here automatically.</p>
            ) : null}
          </div>
        </Card>
      </section>
    </DashboardShell>
  );
}
