import type { PropsWithChildren } from "react";
import { cn } from "@/server/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("glass-card rounded-[28px] p-6", className)}>{children}</div>;
}
