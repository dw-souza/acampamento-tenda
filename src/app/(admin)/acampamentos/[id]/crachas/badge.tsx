import Image from "next/image";
import { plural } from "@/lib/format/labels";
import type { CampPerson } from "../people";

/** Crachá de 9 × 6,5 cm: 8 por folha A4. */
export function Badge({ person, campName }: { person: CampPerson; campName: string }) {
  // Campistas na cor da marca; servos na cor da equipe.
  const color = person.groupColor ?? "var(--tenda-brown)";
  const subtitle =
    person.role === "nanny"
      ? person.parentsNames && `Babá de ${person.parentsNames}`
      : person.role === "child"
        ? person.parentsNames && `Filho(a) de ${person.parentsNames}`
        : person.spouseName && `e ${person.spouseName}`;

  return (
    <div className="flex h-[6.5cm] w-[9cm] break-inside-avoid flex-col overflow-hidden border border-dashed border-neutral-400 bg-white text-neutral-950 [print-color-adjust:exact]">
      <div className="flex h-[1.2cm] items-center gap-2 px-3 text-white" style={{ backgroundColor: color }}>
        <Image src="/logo_tenda.webp" alt="" width={28} height={28} />
        <span className="truncate text-[9pt] font-medium tracking-wide">{campName}</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-3 text-center">
        <p className="text-[30pt] leading-none font-bold tracking-tight uppercase">{person.displayName}</p>
        {subtitle && <p className="mt-2 text-[10pt] uppercase">{subtitle}</p>}
      </div>
      <div className="flex items-center justify-between gap-2 border-t px-3 py-1.5 text-[9pt] font-semibold uppercase">
        <span className="flex items-center gap-1.5 truncate">
          {person.groupColor && (
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: person.groupColor }} />
          )}
          {person.group}
        </span>
        <span className="flex shrink-0 gap-1.5">
          {person.role === "child" && person.age !== null && <span>{plural(person.age, "ano", "anos")}</span>}
          {person.isCoordinator && (
            <span className="rounded bg-neutral-900 px-1 text-white">Coordenador</span>
          )}
        </span>
      </div>
    </div>
  );
}
