import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { listPublishedDraws } from "@/server/services";
import { safeJsonParse } from "@/server/lib/utils";

export default async function DrawsPage() {
  const draws = await listPublishedDraws();

  return (
    <main>
      <SiteHeader />
      <section className="section-shell py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Monthly draw results</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Transparent draw history with published numbers and payout tiers.</h1>
        </div>
        <div className="mt-8 grid gap-6">
          {draws.map((draw: any) => {
            const numbers = safeJsonParse<number[]>(draw.generatedNumbers, []);
            return (
              <Card key={draw.id} className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">{draw.title}</h2>
                    <p className="text-sm text-[var(--muted)]">{draw.monthKey} · {draw.drawType}</p>
                  </div>
                  <p className="text-sm font-medium text-[var(--secondary)]">
                    Prize pool ${Number(draw.prizePoolTotal).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {numbers.map((number) => (
                    <span
                      key={number}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--secondary-soft)] font-black text-[var(--secondary)]"
                    >
                      {number}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
