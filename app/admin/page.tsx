import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { getSessionToken, verifySessionToken } from "@/server/lib/auth";
import { getAdminDashboard, getSessionUserById, listUsers, listWinners, listCharities } from "@/server/services";
import { safeJsonParse, toCurrency } from "@/server/lib/utils";

export default async function AdminPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  const payload = await verifySessionToken(token);
  const session = await getSessionUserById(payload.id);
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const [dashboard, users, winners, charities] = await Promise.all([
    getAdminDashboard(),
    listUsers(),
    listWinners(),
    listCharities()
  ]);

  return (
    <DashboardShell
      title="Admin control center"
      subtitle="Monitor subscriptions, configure draws, manage charities, and review winner verification from one place."
      actions={
        <form action="/api/auth/logout" method="post">
          <Button variant="ghost" type="submit">
            Log out
          </Button>
        </form>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total users" value={String(dashboard.totalUsers)} detail="Registered across all roles." />
        <MetricCard label="Active subscribers" value={String(dashboard.activeSubscriptions)} detail="Current active billing members." />
        <MetricCard label="Prize pool" value={toCurrency(dashboard.totalPrizePool)} detail="Across published draws." />
        <MetricCard label="Charity contributions" value={toCurrency(dashboard.totalContributions)} detail="Subscription-linked contributions only." />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Recent draws</h2>
            <p className="text-sm text-[var(--muted)]">{dashboard.winnersPending} winners pending review</p>
          </div>
          <div className="space-y-4">
            {dashboard.recentDraws.map((draw: any) => (
              <div key={draw.id} className="rounded-2xl bg-white/70 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold">{draw.title}</p>
                    <p className="text-sm text-[var(--muted)]">{draw.monthKey} · {draw.drawType} · {draw.status}</p>
                  </div>
                  <div className="flex gap-2">
                    {safeJsonParse<number[]>(draw.generatedNumbers, []).map((value) => (
                      <span key={value} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--secondary-soft)] font-bold text-[var(--secondary)]">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-black">Charity coverage</h2>
          <div className="space-y-3">
            {charities.map((charity: any) => (
              <div key={charity.id} className="rounded-2xl bg-white/70 px-4 py-3">
                <p className="font-bold">{charity.name}</p>
                <p className="text-sm text-[var(--muted)]">{charity.featured ? "Featured on homepage" : "Directory listing"}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-2xl font-black">User management snapshot</h2>
          <div className="space-y-3">
            {users.slice(0, 6).map((user: any) => (
              <div key={user.id} className="rounded-2xl bg-white/70 px-4 py-3">
                <p className="font-bold">{user.fullName}</p>
                <p className="text-sm text-[var(--muted)]">
                  {user.email} · {user.role} · latest status {user.subscriptions[0]?.status ?? "NONE"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-black">Winner verification queue</h2>
          <div className="space-y-3">
            {winners.slice(0, 6).map((winner: any) => (
              <div key={winner.id} className="rounded-2xl bg-white/70 px-4 py-3">
                <p className="font-bold">{winner.user.fullName}</p>
                <p className="text-sm text-[var(--muted)]">
                  {winner.draw.title} · {winner.matchedCount} matches · {winner.verificationStatus} · {winner.payoutStatus}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </DashboardShell>
  );
}
