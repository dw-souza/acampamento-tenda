import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SelectFilter } from "@/components/filters/select-filter";
import { getCamp, getCampParticipants } from "@/lib/data/camps";
import { campLabel, plural } from "@/lib/format/labels";
import { campPeople, sortByGroup } from "../people";
import { Badge } from "./badge";
import { PrintButton } from "./print-button";

const kindFilter = [
  { value: "campistas", label: "Campistas" },
  { value: "servos", label: "Servos" },
  { value: "criancas", label: "Só crianças" },
  { value: "adultos", label: "Só adultos" },
];

export default async function BadgesPage({ params, searchParams }: PageProps<"/acampamentos/[id]/crachas">) {
  const { id } = await params;
  const { tipo, grupo } = await searchParams;
  const camp = await getCamp(id);
  if (!camp) notFound();

  const everyone = sortByGroup(campPeople(camp, await getCampParticipants(id)));
  const groups = [...new Set(everyone.map((person) => person.group))].map((group) => ({
    value: group,
    label: group,
  }));
  const people = everyone
    .filter((person) => {
      if (tipo === "campistas") return person.participantRole === "camper";
      if (tipo === "servos") return person.participantRole === "server";
      if (tipo === "criancas") return person.role === "child";
      if (tipo === "adultos") return person.role !== "child";
      return true;
    })
    .filter((person) => (typeof grupo === "string" ? person.group === grupo : true));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Suspense>
          <SelectFilter param="tipo" options={kindFilter} allLabel="Todos" />
          <SelectFilter param="grupo" options={groups} allLabel="Todos os grupos" />
        </Suspense>
        <span className="text-sm text-muted-foreground">{plural(people.length, "crachá", "crachás")}</span>
        <div className="ml-auto">
          <PrintButton label="Imprimir crachás" />
        </div>
      </div>
      {people.length === 0 ? (
        <p className="text-sm text-muted-foreground print:hidden">Ninguém para imprimir com esse filtro.</p>
      ) : (
        <div className="grid w-fit grid-cols-1 md:grid-cols-2 print:grid-cols-2">
          {people.map((person) => (
            <Badge key={person.id} person={person} campName={campLabel(camp)} />
          ))}
        </div>
      )}
    </div>
  );
}
