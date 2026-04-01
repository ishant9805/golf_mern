import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { getCharityBySlug } from "@/server/services";

export default async function CharityDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const charity = await getCharityBySlug(slug);
  if (!charity) notFound();

  const events = Array.isArray(charity.upcomingEvents) ? charity.upcomingEvents : [];

  return (
    <main>
      <SiteHeader />
      <section className="section-shell py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Charity profile</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">{charity.name}</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">{charity.description}</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <Card className="space-y-4">
            <h2 className="text-2xl font-black">Mission</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">{charity.mission}</p>
          </Card>
          <Card className="space-y-4">
            <h2 className="text-2xl font-black">Upcoming events</h2>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event: any, index: number) => (
                  <div key={`${String((event as { title: string }).title)}-${index}`} className="rounded-2xl bg-white/60 p-4">
                    <p className="font-bold">{String((event as { title: string }).title)}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {String((event as { date: string }).date)} · {String((event as { location: string }).location)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">Upcoming events will be announced soon.</p>
            )}
          </Card>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
