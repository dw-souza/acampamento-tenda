import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "info" | "danger" | "neutral" | "brand";

const tones: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-600/25",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/30",
  info: "bg-sky-50 text-sky-800 ring-sky-600/25",
  danger: "bg-red-50 text-red-700 ring-red-600/25",
  neutral: "bg-secondary text-secondary-foreground ring-border",
  brand: "bg-primary text-primary-foreground ring-primary",
};

const dots: Record<Tone, string> = {
  success: "bg-emerald-600",
  warning: "bg-amber-500",
  info: "bg-sky-600",
  danger: "bg-red-600",
  neutral: "bg-muted-foreground",
  brand: "bg-tenda-yellow",
};

/** Situação com cor e texto (nunca só cor). */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dots[tone])} aria-hidden />
      {children}
    </span>
  );
}
