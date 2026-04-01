"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toCurrency } from "@/server/lib/utils";

type AdminConsoleProps = {
  users: any[];
  winners: any[];
  charities: any[];
  dashboard: any;
};

async function sendJson(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? "Request failed.");
  }
  return result.data;
}

export function AdminConsole({ users, winners, charities, dashboard }: AdminConsoleProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [drawForm, setDrawForm] = useState({
    monthKey: "",
    title: "",
    drawType: "RANDOM",
    notes: ""
  });
  const [newCharity, setNewCharity] = useState({
    name: "",
    slug: "",
    imageUrl: "",
    location: "",
    description: "",
    mission: "",
    featured: false
  });
  const [simulatedDraw, setSimulatedDraw] = useState<any | null>(null);

  const activeSubscriptions = useMemo(
    () => users.flatMap((user) => user.subscriptions ?? []).filter((subscription) => subscription.status === "ACTIVE"),
    [users]
  );

  function runAction(task: () => Promise<void>) {
    setMessage("");
    startTransition(async () => {
      try {
        await task();
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{message}</div> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Published draws</p>
          <p className="text-3xl font-black">{dashboard.drawStatistics.publishedDraws}</p>
          <p className="text-sm text-[var(--muted)]">Official results visible to subscribers.</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Random vs algorithmic</p>
          <p className="text-3xl font-black">
            {dashboard.drawStatistics.randomDraws} / {dashboard.drawStatistics.algorithmicDraws}
          </p>
          <p className="text-sm text-[var(--muted)]">Draw mode split across the platform.</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Total winners</p>
          <p className="text-3xl font-black">{dashboard.drawStatistics.totalWinners}</p>
          <p className="text-sm text-[var(--muted)]">Winners recorded across all draws.</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Managed subscriptions</p>
          <p className="text-3xl font-black">{activeSubscriptions.length}</p>
          <p className="text-sm text-[var(--muted)]">Subscriptions currently active in the system.</p>
        </Card>
      </section>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Draw management</h2>
          <p className="text-sm text-[var(--muted)]">Configure draw logic, run simulations, and publish results.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <input
            value={drawForm.monthKey}
            onChange={(event) => setDrawForm((state) => ({ ...state, monthKey: event.target.value }))}
            placeholder="2026-04"
            className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
          />
          <input
            value={drawForm.title}
            onChange={(event) => setDrawForm((state) => ({ ...state, title: event.target.value }))}
            placeholder="April Impact Draw"
            className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
          />
          <select
            value={drawForm.drawType}
            onChange={(event) => setDrawForm((state) => ({ ...state, drawType: event.target.value }))}
            className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
          >
            <option value="RANDOM">Random</option>
            <option value="ALGORITHMIC">Algorithmic</option>
          </select>
          <Button
            disabled={isPending}
            onClick={() =>
              runAction(async () => {
                const result = await sendJson("/api/admin/draws", "POST", drawForm);
                setSimulatedDraw(result);
                setMessage("Draw simulation saved. Publish it when you are ready.");
              })
            }
          >
            Run simulation
          </Button>
        </div>
        {simulatedDraw ? (
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="font-bold">{simulatedDraw.title}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Simulated as {simulatedDraw.drawType}. Use publish to make the result official.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(simulatedDraw.simulationNumbers ?? simulatedDraw.generatedNumbers ?? []).map((value: number) => (
                <span
                  key={value}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary-soft)] font-bold text-[var(--secondary)]"
                >
                  {value}
                </span>
              ))}
            </div>
            <Button
              className="mt-4"
              disabled={isPending}
              onClick={() =>
                runAction(async () => {
                  await sendJson(`/api/admin/draws/${simulatedDraw.id}/publish`, "POST");
                  setSimulatedDraw(null);
                  setMessage("Draw published successfully.");
                })
              }
            >
              Publish results
            </Button>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Charity management</h2>
          <p className="text-sm text-[var(--muted)]">Add, edit, delete charities and manage visible content fields.</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={newCharity.name} onChange={(event) => setNewCharity((state) => ({ ...state, name: event.target.value }))} placeholder="New charity name" className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            <input value={newCharity.slug} onChange={(event) => setNewCharity((state) => ({ ...state, slug: event.target.value }))} placeholder="new-charity-slug" className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            <input value={newCharity.imageUrl} onChange={(event) => setNewCharity((state) => ({ ...state, imageUrl: event.target.value }))} placeholder="Image URL" className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            <input value={newCharity.location} onChange={(event) => setNewCharity((state) => ({ ...state, location: event.target.value }))} placeholder="Location" className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
            <textarea value={newCharity.description} onChange={(event) => setNewCharity((state) => ({ ...state, description: event.target.value }))} placeholder="Description" className="min-h-24 rounded-2xl border border-black/10 bg-white px-4 py-3 md:col-span-2" />
            <textarea value={newCharity.mission} onChange={(event) => setNewCharity((state) => ({ ...state, mission: event.target.value }))} placeholder="Mission" className="min-h-24 rounded-2xl border border-black/10 bg-white px-4 py-3 md:col-span-2" />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
            <input type="checkbox" checked={newCharity.featured} onChange={(event) => setNewCharity((state) => ({ ...state, featured: event.target.checked }))} />
            Feature on homepage
          </label>
          <Button
            className="mt-4"
            disabled={isPending}
            onClick={() =>
              runAction(async () => {
                await sendJson("/api/admin/charities", "POST", {
                  ...newCharity,
                  upcomingEvents: []
                });
                setNewCharity({
                  name: "",
                  slug: "",
                  imageUrl: "",
                  location: "",
                  description: "",
                  mission: "",
                  featured: false
                });
                setMessage("Charity created.");
              })
            }
          >
            Add charity
          </Button>
        </div>
        <div className="space-y-4">
          {charities.map((charity) => (
            <div key={charity.id} className="rounded-2xl bg-white/70 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <input defaultValue={charity.name} id={`name-${charity.id}`} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
                <input defaultValue={charity.slug} id={`slug-${charity.id}`} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
                <input defaultValue={charity.imageUrl ?? ""} id={`image-${charity.id}`} placeholder="Image URL" className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
                <input defaultValue={charity.location ?? ""} id={`location-${charity.id}`} placeholder="Location" className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
                <textarea defaultValue={charity.description} id={`description-${charity.id}`} className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 md:col-span-2" />
                <textarea defaultValue={charity.mission} id={`mission-${charity.id}`} className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 md:col-span-2" />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
                <input type="checkbox" id={`featured-${charity.id}`} defaultChecked={charity.featured} />
                Featured on homepage
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  disabled={isPending}
                  onClick={() =>
                    runAction(async () => {
                      await sendJson(`/api/admin/charities/${charity.id}`, "PATCH", {
                        name: (document.getElementById(`name-${charity.id}`) as HTMLInputElement).value,
                        slug: (document.getElementById(`slug-${charity.id}`) as HTMLInputElement).value,
                        imageUrl: (document.getElementById(`image-${charity.id}`) as HTMLInputElement).value,
                        location: (document.getElementById(`location-${charity.id}`) as HTMLInputElement).value,
                        description: (document.getElementById(`description-${charity.id}`) as HTMLTextAreaElement).value,
                        mission: (document.getElementById(`mission-${charity.id}`) as HTMLTextAreaElement).value,
                        featured: (document.getElementById(`featured-${charity.id}`) as HTMLInputElement).checked,
                        upcomingEvents: charity.upcomingEvents ?? []
                      });
                      setMessage("Charity updated.");
                    })
                  }
                >
                  Save charity
                </Button>
                <Button
                  variant="ghost"
                  disabled={isPending}
                  onClick={() =>
                    runAction(async () => {
                      await fetch(`/api/admin/charities/${charity.id}`, { method: "DELETE" });
                      setMessage("Charity deleted.");
                    })
                  }
                >
                  Delete charity
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">User management</h2>
          <p className="text-sm text-[var(--muted)]">View and edit profiles, latest scores, and subscription state.</p>
        </div>
        <div className="space-y-4">
          {users.map((user) => {
            const latestSubscription = user.subscriptions?.[0];
            return (
              <div key={user.id} className="rounded-2xl bg-white/70 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input defaultValue={user.fullName} id={`user-name-${user.id}`} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
                  <input defaultValue={user.email} id={`user-email-${user.id}`} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
                  <select defaultValue={user.role} id={`user-role-${user.id}`} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="SUBSCRIBER">SUBSCRIBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <input defaultValue={Number(user.charityPercentage)} id={`user-charity-${user.id}`} type="number" min={10} max={100} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    disabled={isPending}
                    onClick={() =>
                      runAction(async () => {
                        await sendJson(`/api/admin/users/${user.id}`, "PATCH", {
                          fullName: (document.getElementById(`user-name-${user.id}`) as HTMLInputElement).value,
                          email: (document.getElementById(`user-email-${user.id}`) as HTMLInputElement).value,
                          role: (document.getElementById(`user-role-${user.id}`) as HTMLSelectElement).value,
                          charityPercentage: Number((document.getElementById(`user-charity-${user.id}`) as HTMLInputElement).value),
                          selectedCharityId: user.selectedCharityId
                        });
                        setMessage("User profile updated.");
                      })
                    }
                  >
                    Save profile
                  </Button>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Scores</p>
                    {(user.scores ?? []).map((score: any) => (
                      <div key={score.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white px-3 py-3">
                        <input defaultValue={score.value} id={`score-value-${score.id}`} type="number" min={1} max={45} className="w-24 rounded-xl border border-black/10 px-3 py-2" />
                        <input defaultValue={new Date(score.playedAt).toISOString().slice(0, 10)} id={`score-date-${score.id}`} type="date" className="rounded-xl border border-black/10 px-3 py-2" />
                        <Button
                          variant="secondary"
                          disabled={isPending}
                          onClick={() =>
                            runAction(async () => {
                              const dateValue = (document.getElementById(`score-date-${score.id}`) as HTMLInputElement).value;
                              await sendJson(`/api/admin/scores/${score.id}`, "PATCH", {
                                value: Number((document.getElementById(`score-value-${score.id}`) as HTMLInputElement).value),
                                playedAt: new Date(`${dateValue}T00:00:00.000Z`).toISOString()
                              });
                              setMessage("Score updated.");
                            })
                          }
                        >
                          Save score
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Subscription</p>
                    {latestSubscription ? (
                      <div className="rounded-2xl bg-white p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <select defaultValue={latestSubscription.plan} id={`sub-plan-${latestSubscription.id}`} className="rounded-2xl border border-black/10 px-4 py-3">
                            <option value="MONTHLY">MONTHLY</option>
                            <option value="YEARLY">YEARLY</option>
                          </select>
                          <select defaultValue={latestSubscription.status} id={`sub-status-${latestSubscription.id}`} className="rounded-2xl border border-black/10 px-4 py-3">
                            <option value="INCOMPLETE">INCOMPLETE</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PAST_DUE">PAST_DUE</option>
                            <option value="CANCELED">CANCELED</option>
                            <option value="EXPIRED">EXPIRED</option>
                          </select>
                          <input defaultValue={latestSubscription.currentPeriodStart ? new Date(latestSubscription.currentPeriodStart).toISOString().slice(0, 10) : ""} id={`sub-start-${latestSubscription.id}`} type="date" className="rounded-2xl border border-black/10 px-4 py-3" />
                          <input defaultValue={latestSubscription.currentPeriodEnd ? new Date(latestSubscription.currentPeriodEnd).toISOString().slice(0, 10) : ""} id={`sub-end-${latestSubscription.id}`} type="date" className="rounded-2xl border border-black/10 px-4 py-3" />
                        </div>
                        <label className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
                          <input type="checkbox" id={`sub-cancel-${latestSubscription.id}`} defaultChecked={latestSubscription.cancelAtPeriodEnd} />
                          Cancel at period end
                        </label>
                        <Button
                          className="mt-4"
                          disabled={isPending}
                          onClick={() =>
                            runAction(async () => {
                              const startDate = (document.getElementById(`sub-start-${latestSubscription.id}`) as HTMLInputElement).value;
                              const endDate = (document.getElementById(`sub-end-${latestSubscription.id}`) as HTMLInputElement).value;
                              await sendJson(`/api/admin/subscriptions/${latestSubscription.id}`, "PATCH", {
                                plan: (document.getElementById(`sub-plan-${latestSubscription.id}`) as HTMLSelectElement).value,
                                status: (document.getElementById(`sub-status-${latestSubscription.id}`) as HTMLSelectElement).value,
                                currentPeriodStart: startDate ? new Date(`${startDate}T00:00:00.000Z`).toISOString() : null,
                                currentPeriodEnd: endDate ? new Date(`${endDate}T00:00:00.000Z`).toISOString() : null,
                                cancelAtPeriodEnd: (document.getElementById(`sub-cancel-${latestSubscription.id}`) as HTMLInputElement).checked
                              });
                              setMessage("Subscription updated.");
                            })
                          }
                        >
                          Save subscription
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">No subscription on record.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Winners management</h2>
          <p className="text-sm text-[var(--muted)]">Review proof submissions and mark payouts as completed.</p>
        </div>
        <div className="space-y-3">
          {winners.map((winner) => (
            <div key={winner.id} className="rounded-2xl bg-white/70 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold">
                    {winner.user.fullName} · {winner.draw.title}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {winner.matchedCount} matches · {toCurrency(Number(winner.prizeAmount))} · proof {winner.proofImagePath ? "uploaded" : "missing"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={isPending}
                    onClick={() =>
                      runAction(async () => {
                        await sendJson(`/api/admin/winners/${winner.id}/review`, "POST", {
                          verificationStatus: "APPROVED"
                        });
                        setMessage("Winner approved.");
                      })
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={isPending}
                    onClick={() =>
                      runAction(async () => {
                        await sendJson(`/api/admin/winners/${winner.id}/review`, "POST", {
                          verificationStatus: "REJECTED"
                        });
                        setMessage("Winner rejected.");
                      })
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() =>
                      runAction(async () => {
                        await sendJson(`/api/admin/winners/${winner.id}/payout`, "POST", {
                          payoutStatus: "PAID"
                        });
                        setMessage("Payout marked as completed.");
                      })
                    }
                  >
                    Mark paid
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
