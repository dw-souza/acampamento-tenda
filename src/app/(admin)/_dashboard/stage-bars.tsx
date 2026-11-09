import { Tent as TentIcon } from "lucide-react";
import Link from "next/link";
import { tentLabel } from "@/lib/format/labels";

type Row = {
  id: string | null;
  name: string;
  hasCamp: boolean;
  tents: { id: string; number: number; parish: { name: string } }[];
};

// Uma série só (tendas por etapa): uma cor (o marrom da marca), sem legenda; o título diz o que é.
const BAR_COLOR = "var(--primary)";

/**
 * Barras horizontais: quantas tendas ativos estão em cada etapa do caminho.
 * Cada linha leva à lista de tendas filtrada (a versão em tabela do gráfico);
 * passar o mouse ou focar mostra quais são os tendas.
 */
export function StageBars({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((row) => row.tents.length));

  return (
    <ol className="flex flex-col gap-1">
      {rows.map((row) => {
        const n = row.tents.length;
        return (
          <li key={row.id ?? "none"}>
            <Link
              href={`/tendas?etapa=${row.id ?? "nenhuma"}`}
              className="group relative grid grid-cols-[9rem_1fr] items-center gap-3 rounded-md px-2 py-1.5 outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-1 truncate text-sm">
                {row.name}
                {row.hasCamp && (
                  <TentIcon
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-label="etapa com acampamento"
                  />
                )}
              </span>
              <span className="flex items-center gap-2">
                {n > 0 && (
                  <span
                    className="h-4 max-h-6 rounded-r-[4px]"
                    style={{ width: `${(n / max) * 100}%`, backgroundColor: BAR_COLOR }}
                    aria-hidden
                  />
                )}
                <span className="text-sm text-muted-foreground tabular-nums">{n}</span>
              </span>
              {n > 0 && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute top-full left-[9.75rem] z-10 mt-1 hidden max-w-sm rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block"
                >
                  {row.tents.map((tent) => (
                    <span key={tent.id} className="block whitespace-nowrap">
                      {tentLabel(tent)} · {tent.parish.name}
                    </span>
                  ))}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
