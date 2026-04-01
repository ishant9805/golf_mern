import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";

export function DashboardShell({
  title,
  subtitle,
  actions,
  children
}: PropsWithChildren<{ title: string; subtitle: string; actions?: ReactNode }>) {
  return (
    <div className="section-shell py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Fairway for Good
          </Link>
          <h1 className="mt-3 text-4xl font-black tracking-tight">{title}</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">{subtitle}</p>
        </div>
        {actions}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
