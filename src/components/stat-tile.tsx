import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

/** Indicador numérico com ícone: rótulo, valor em destaque e detalhe opcional. */
export function StatTile({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <Card size="sm" className="relative overflow-hidden">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{value}</p>
          {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-4.5" />
        </span>
      </CardContent>
    </Card>
  );
}
