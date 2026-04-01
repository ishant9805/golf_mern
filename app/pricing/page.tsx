import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    title: "Monthly Impact",
    price: "$29",
    cadence: "/month",
    description: "Flexible access with full dashboard features, monthly draws, and charity-linked contribution tracking."
  },
  {
    title: "Yearly Impact",
    price: "$290",
    cadence: "/year",
    description: "Best value plan with an annual discount and uninterrupted participation in every monthly draw."
  }
];

export default function PricingPage() {
  return (
    <main>
      <SiteHeader />
      <section className="section-shell py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Membership plans</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Choose the membership that powers your play and your impact.</h1>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.title} className="space-y-4">
              <h2 className="text-3xl font-black">{plan.title}</h2>
              <p className="text-5xl font-black">
                {plan.price}
                <span className="text-lg font-medium text-[var(--muted)]">{plan.cadence}</span>
              </p>
              <p className="text-sm leading-7 text-[var(--muted)]">{plan.description}</p>
              <Link href="/signup">
                <Button>Start subscription</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
