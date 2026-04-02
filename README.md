# Golf Charity Subscription Platform MVP

Production-oriented MVP for a golf charity subscription platform built with Next.js App Router, Prisma, Supabase Postgres, Stripe subscriptions, JWT auth, Tailwind CSS, and Framer Motion.

## Features

- Public marketing pages, pricing, charity directory, charity profiles, and published draw history
- JWT auth with secure HTTP-only cookies and role-aware route protection
- Subscriber APIs and dashboard for subscription status, scores, charity impact, and winnings
- Admin APIs and dashboard for draw control, charity management, winner review, and analytics
- Stripe Checkout subscriptions with webhook handlers for lifecycle sync
- Rolling golf score logic with max 5 stored scores and duplicate validation
- Random and weighted draw generation with jackpot rollover rules
- Supabase Storage integration for winner proof uploads
- Seed data for demo admin, subscriber, charities, subscriptions, scores, payments, and draw results
- Vitest coverage for the core business rules

## Stack

- Next.js 15
- React 19
- TypeScript
- Prisma
- PostgreSQL via Supabase
- Stripe
- Tailwind CSS 4
- Framer Motion
- Vitest

## Folder Structure

```text
app/                 Next.js pages and route handlers
components/          UI, layout, and form components
prisma/              Prisma schema and seed script
server/api/          Route guards
server/domain/       Shared business constants and pure rules
server/lib/          Env, auth, prisma, stripe, storage, API helpers
server/services/     Business logic layer
server/validators/   Zod request validation
tests/               Core rule tests
types/               Shared app types
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in all values.
   Runtime should use the pooled Supabase connection string in `DATABASE_URL`.
   Prisma CLI should use the direct database connection in `DIRECT_URL`.

3. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed demo data:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

## Supabase Setup

1. Create a new Supabase project.
2. Set `DATABASE_URL` to the Supavisor transaction pooler connection string and append `?pgbouncer=true`.
3. Set `DIRECT_URL` to the direct database connection string from Supabase.
4. Create a public or private storage bucket matching `SUPABASE_STORAGE_BUCKET`, for example `winner-proofs`.
5. Add the project URL to `NEXT_PUBLIC_SUPABASE_URL`.
6. Add the service role key to `SUPABASE_SERVICE_ROLE_KEY`.

Connection guidance:

- `DATABASE_URL`
  Use the pooled Supabase URL for application runtime. Example:
  `postgresql://postgres.your-project-ref:password@aws-0-your-region.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL`
  Use the direct database URL for Prisma CLI commands. Example:
  `postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres`

This split follows Prisma and Supabase guidance for Prisma + Supavisor and helps avoid connection resets and pooler-related runtime failures.

## Stripe Setup

1. Create two recurring Stripe prices:
   - Monthly: `$29`
   - Yearly: `$290`
2. Add their IDs to:
   - `STRIPE_MONTHLY_PRICE_ID`
   - `STRIPE_YEARLY_PRICE_ID`
3. Add your Stripe secret key to `STRIPE_SECRET_KEY`.
4. Expose the local webhook endpoint:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

5. Copy the returned webhook secret into `STRIPE_WEBHOOK_SECRET`.
6. The app listens for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

## Demo Credentials

After running the seed script:

- Admin: `admin@golfcharity.test`
- Subscriber: `subscriber@golfcharity.test`
- Password: `Password123!`

## Testing

Run the business-rule tests:

```bash
npm test
```

Current automated coverage includes:

- Rolling score retention
- Random and weighted draw logic
- Match counting
- Prize pool distribution and rollover
- Charity contribution calculation

## Important Notes

- Prisma client generation may require network access in restricted environments because Prisma may download engine binaries on first generate.
- Build and runtime require valid environment variables; missing values will fail fast by design.
- Subscriber access is enforced from the locally stored subscription state, which is synchronized from Stripe webhooks.
- Winner proof uploads use Supabase Storage paths stored in the database.
