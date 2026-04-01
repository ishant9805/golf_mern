import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { listCharities } from "@/server/services";

export default async function CharitiesPage() {
  const charities = await listCharities();

  return (
    <main>
      <SiteHeader />
      <section className="section-shell py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Charity directory</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Choose a cause with visible community impact.</h1>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {charities.map((charity: any) => (
            <Link key={charity.id} href={`/charities/${charity.slug}`}>
              <Card className="h-full space-y-3 transition-transform duration-200 hover:-translate-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {charity.featured ? "Featured charity" : "Community partner"}
                </p>
                <h2 className="text-2xl font-black">{charity.name}</h2>
                <p className="text-sm leading-7 text-[var(--muted)]">{charity.description}</p>
                <p className="text-sm font-medium text-[var(--secondary)]">{charity.location ?? "Global impact"}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
