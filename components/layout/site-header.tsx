import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionToken, verifySessionToken } from "@/server/lib/auth";
import { getSessionUserById } from "@/server/services";

export async function SiteHeader() {
  const token = await getSessionToken();
  let session: Awaited<ReturnType<typeof getSessionUserById>> = null;

  if (token) {
    try {
      const payload = await verifySessionToken(token);
      session = await getSessionUserById(payload.id);
    } catch {
      session = null;
    }
  }

  return (
    <header className="section-shell flex items-center justify-between py-6">
      <Link href="/" className="text-lg font-black tracking-[0.16em] uppercase">
        Fairway for Good
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
        <Link href="/charities">Charities</Link>
        <Link href="/draws">Draws</Link>
        <Link href="/pricing">Pricing</Link>
      </nav>
      <div className="flex items-center gap-3">
        {session ? (
          <>
            <Link
              href={session.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="text-sm font-medium text-[var(--muted)]"
            >
              {session.role === "ADMIN" ? "Admin" : "Dashboard"}
            </Link>
            <form action="/api/auth/logout" method="post">
              <Button variant="ghost" type="submit">
                Log out
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-[var(--muted)]">
              Log in
            </Link>
            <Link href="/signup">
              <Button>Subscribe</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
