import Link from "next/link";
import { ArrowRight, HeartHandshake, Trophy, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: HeartHandshake,
    title: "Charity-first journey",
    copy: "Every subscription automatically funds a cause you choose, with a minimum 10% contribution tracked in your dashboard."
  },
  {
    icon: Trophy,
    title: "Monthly draw engine",
    copy: "Join random or weighted monthly draws driven by real Stableford score history and transparent match logic."
  },
  {
    icon: Wallet,
    title: "Subscriber rewards",
    copy: "Prize pools are calculated from active subscriptions, with jackpot rollover and equal winner splits built in."
  }
];

export default function HomePage() {
  return (
    <main className="pb-10">
      <SiteHeader />
      <section className="section-shell grid gap-8 pb-10 pt-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Subscription Golf, Reframed
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Play with purpose. Win with transparency. Give with heart.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Fairway for Good blends golf score tracking, monthly prize draws, and charity impact into a modern,
            emotional subscription experience that feels nothing like a traditional golf site.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/signup">
              <Button className="px-7">
                Start your membership
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary">See plans</Button>
            </Link>
          </div>
        </div>
        <Card className="overflow-hidden bg-[var(--surface-strong)] p-0">
          <div className="bg-[linear-gradient(135deg,#1f5f57,#102418)] p-8 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">How it works</p>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-3xl font-black">1. Subscribe</p>
                <p className="mt-2 text-sm text-white/75">Choose monthly or yearly access and select your charity.</p>
              </div>
              <div>
                <p className="text-3xl font-black">2. Track scores</p>
                <p className="mt-2 text-sm text-white/75">Keep your latest five Stableford scores ready for the draw engine.</p>
              </div>
              <div>
                <p className="text-3xl font-black">3. Enter the draw</p>
                <p className="mt-2 text-sm text-white/75">Compete for 3, 4, and 5 match rewards every month.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="section-shell grid gap-6 py-10 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--secondary-soft)] text-[var(--secondary)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black">{item.title}</h2>
              <p className="text-sm leading-7 text-[var(--muted)]">{item.copy}</p>
            </Card>
          );
        })}
      </section>

      <section className="section-shell py-10">
        <Card className="p-3">
          <div
            className="grid gap-6 rounded-[24px] p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8"
            style={{ background: "linear-gradient(135deg, #102418 0%, #1f5f57 100%)", color: "#fffaf2" }}
          >
            <div>
              <p className="text-sm uppercase tracking-[0.2em]" style={{ color: "rgba(255, 250, 242, 0.7)" }}>
                Built for confidence
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">
                Transparent prize rules, visible impact, and admin-ready control.
              </h2>
            </div>
            <div
              className="grid gap-4 text-sm md:grid-cols-2"
              style={{ color: "rgba(255, 250, 242, 0.84)" }}
            >
              <p>Automatic rolling score window of five entries with validation and duplicate protection.</p>
              <p>Stripe subscription lifecycle synced by webhooks so subscriber access follows payment state.</p>
              <p>Admin simulation mode lets you preview weighted or random draws before publishing official results.</p>
              <p>Winner proof uploads and payout tracking keep the verification flow accountable end to end.</p>
            </div>
          </div>
        </Card>
      </section>
      <SiteFooter />
    </main>
  );
}
