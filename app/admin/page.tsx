import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { AdminConsole } from "@/components/admin/admin-console";
import { getSessionToken, verifySessionToken } from "@/server/lib/auth";
import { getAdminDashboard, getSessionUserById, listUsers, listWinners, listCharities } from "@/server/services";
import { toCurrency } from "@/server/lib/utils";

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
      <AdminConsole users={users as any[]} winners={winners as any[]} charities={charities as any[]} dashboard={dashboard as any} />
    </DashboardShell>
  );
}
