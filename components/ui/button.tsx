import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/server/lib/utils";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-[var(--foreground)] text-white shadow-lg shadow-black/10",
        variant === "secondary" && "bg-[var(--secondary-soft)] text-[var(--secondary)]",
        variant === "ghost" && "bg-white/60 text-[var(--foreground)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
