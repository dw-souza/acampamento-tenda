import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { SelectFilter } from "@/components/filters/select-filter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCamp, getCampParticipants } from "@/lib/data/camps";
import { plural } from "@/lib/format/labels";
import { type CampPerson, campPeople, sortByGroup } from "../people";
import { PrintButton } from "../crachas/print-button";

const sections = [
  { value: "grupos", label: "Pessoas por grupo" },
  { value: "criancas", label: "Crianças" },
  { value: "restricoes", label: "Restrições alimentares" },
  { value: "necessidades", label: "Necessidades especiais" },
];

export default async function CampListsPage({
  params,
  searchParams,
}: PageProps<"/acampamentos/[id]/listas">) {
  const { id } = await params;
  const { secao } = await searchParams;
  const camp = await getCamp(id);
  if (!camp) notFound();
  const people = sortByGroup(campPeople(camp, await getCampParticipants(id)));
  const show = (section: string) => typeof secao !== "string" || secao === section;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Suspense>
          <SelectFilter param="secao" options={sections} allLabel="Todas as listas" />
        </Suspense>
        <div className="ml-auto">
          <PrintButton />
        </div>
      </div>
      <h2 className="hidden text-lg font-semibold print:block">{camp.name}</h2>

      {show("grupos") && <GroupsSection people={people} />}
      {show("criancas") && <ChildrenSection people={people} />}
      {show("restricoes") && (
        <PeopleNotes
          title="Restrições alimentares"
          description="Para a cozinha."
          people={people.filter((person) => person.dietaryRestrictions)}
          note={(person) => person.dietaryRestrictions}
        />
      )}
      {show("necessidades") && (
        <PeopleNotes
          title="Necessidades especiais"
          people={people.filter((person) => person.specialNeeds)}
          note={(person) => person.specialNeeds}
        />
      )}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="break-inside-avoid print:border-0 print:shadow-none print:ring-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function GroupsSection({ people }: { people: CampPerson[] }) {
  const groups = new Map<string, { camper: boolean; adults: number; children: number; toddlers: number }>();
  for (const person of people) {
    const group = groups.get(person.group) ?? {
      camper: person.participantRole === "camper",
      adults: 0,
      children: 0,
      toddlers: 0,
    };
    if (person.role === "child") group.children += 1;
    else group.adults += 1;
    if (person.toddler) group.toddlers += 1;
    groups.set(person.group, group);
  }
  const rows = [...groups.entries()];
  const total = rows.reduce(
    (sum, [, group]) => ({
      adults: sum.adults + group.adults,
      children: sum.children + group.children,
      toddlers: sum.toddlers + group.toddlers,
    }),
    { adults: 0, children: 0, toddlers: 0 },
  );

  return (
    <Section
      title="Pessoas por grupo"
      description="Quem vai de fato: campistas por tenda e servos por equipe."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Grupo</TableHead>
            <TableHead className="text-right">Adultos</TableHead>
            <TableHead className="text-right">Filhos</TableHead>
            <TableHead className="text-right">Pajem</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([name, group]) => (
            <TableRow key={name}>
              <TableCell>
                {name}
                {group.camper && (
                  <Badge variant="outline" className="ml-2">
                    Campistas
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">{group.adults}</TableCell>
              <TableCell className="text-right tabular-nums">{group.children}</TableCell>
              <TableCell className="text-right tabular-nums">{group.toddlers}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {group.adults + group.children}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right tabular-nums">{total.adults}</TableCell>
            <TableCell className="text-right tabular-nums">{total.children}</TableCell>
            <TableCell className="text-right tabular-nums">{total.toddlers}</TableCell>
            <TableCell className="text-right tabular-nums">{total.adults + total.children}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Section>
  );
}

function ChildrenSection({ people }: { people: CampPerson[] }) {
  const children = people
    .filter((person) => person.role === "child")
    .sort((a, b) => (a.age ?? 99) - (b.age ?? 99) || a.fullName.localeCompare(b.fullName));

  return (
    <Section title={`Crianças (${children.length})`} description="Por idade, para a equipe Filhos.">
      {children.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma criança.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Idade</TableHead>
              <TableHead>Pais</TableHead>
              <TableHead>Grupo dos pais</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow key={child.id}>
                <TableCell className="font-medium">
                  {child.fullName}
                  {child.toddler && (
                    <Badge variant="secondary" className="ml-2">
                      Pajem
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{child.age ?? "—"}</TableCell>
                <TableCell>{child.parentsNames}</TableCell>
                <TableCell>{child.group}</TableCell>
                <TableCell className="whitespace-normal">
                  {[child.dietaryRestrictions, child.specialNeeds].filter(Boolean).join(" · ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}

function PeopleNotes({
  title,
  description,
  people,
  note,
}: {
  title: string;
  description?: string;
  people: CampPerson[];
  note: (person: CampPerson) => string | null;
}) {
  return (
    <Section title={`${title} (${people.length})`} description={description}>
      {people.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ninguém.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">
                  {person.fullName}
                  {person.role === "child" && person.age !== null && (
                    <span className="ml-1 text-muted-foreground">({plural(person.age, "ano", "anos")})</span>
                  )}
                </TableCell>
                <TableCell>{person.group}</TableCell>
                <TableCell className="whitespace-normal">{note(person)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}
