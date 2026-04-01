import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="text-sm text-[var(--muted)]">{detail}</p>
    </Card>
  );
}
