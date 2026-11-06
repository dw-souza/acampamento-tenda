import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { AddSelect } from "@/components/add-select";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parishOptions } from "@/lib/data/parishes";
import {
  type Camp,
  getCamp,
  getCampParticipants,
  tentsAvailableForCamp,
  toSummaryInput,
} from "@/lib/data/camps";
import { countsTowardCamp, summarizeCamp } from "@/lib/domain/camp-summary";
import { tentLabel } from "@/lib/format/labels";
import { formatMoney } from "@/lib/format/money";
import {
  addCampParish,
  addCampTent,
  closeRegistrations,
  deleteCamp,
  finishCamp,
  openRegistrations,
  removeCampParish,
  removeCampTent,
} from "../actions";

export default async function CampOverviewPage({ params }: PageProps<"/acampamentos/[id]">) {
  const { id } = await params;
  const camp = await getCamp(id);
  if (!camp) notFound();
  const participants = await getCampParticipants(camp.id);
  const totals = summarizeCamp(participants.map(toSummaryInput), camp);
  const campers = summarizeCamp(participants.filter((p) => p.role === "camper").map(toSummaryInput), camp);

  const stats = [
    {
      label: "Famílias campistas",
      value: camp.expectedFamilies ? `${campers.families} / ${camp.expectedFamilies}` : campers.families,
    },
    { label: "Famílias servindo", value: totals.families - campers.families },
    { label: "Adultos", value: totals.adults },
    { label: "Filhos", value: totals.children },
    { label: "Pajem (menores de 3)", value: totals.toddlers },
    { label: "Valor esperado", value: formatMoney(totals.expectedCents) },
    { label: "Arrecadado", value: formatMoney(totals.paidCents) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl! tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <StatusCard camp={camp} />
      {camp.stage.formsTents ? <ParishesCard camp={camp} /> : <TentsCard camp={camp} />}
    </div>
  );
}

function StatusCard({ camp }: { camp: Camp }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Situação</CardTitle>
        <CardDescription>
          {camp.status === "draft" && "Em preparação. Abra as inscrições quando estiver pronto."}
          {camp.status === "open" &&
            (camp.stage.formsTents
              ? "Ao encerrar as inscrições, cada tenda em formação passa a ativa com as famílias confirmadas."
              : "Ao encerrar, a lista de campistas fica fechada.")}
          {camp.status === "closed" &&
            "Depois do acampamento, marque como realizado para registrar a etapa nas tendas."}
          {camp.status === "finished" && "Acampamento realizado."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        {camp.status === "draft" && (
          <ActionButton action={openRegistrations.bind(null, camp.id)}>Abrir inscrições</ActionButton>
        )}
        {camp.status === "open" && (
          <ActionButton
            action={closeRegistrations.bind(null, camp.id)}
            successMessage="Inscrições encerradas."
            confirm={{
              title: "Encerrar inscrições?",
              description: camp.stage.formsTents
                ? "As tendas em formação passam a ativas. Famílias canceladas ou na lista de espera saem da tenda. Inscrições pendentes impedem o encerramento."
                : "Inscrições pendentes impedem o encerramento.",
              confirmLabel: "Encerrar",
            }}
          >
            Encerrar inscrições
          </ActionButton>
        )}
        {camp.status === "closed" && (
          <ActionButton
            action={finishCamp.bind(null, camp.id)}
            successMessage="Acampamento realizado."
            confirm={{
              title: "Marcar como realizado?",
              description: `As tendas campistas passam para a etapa ${camp.stage.name} no caminho.`,
              confirmLabel: "Marcar como realizado",
            }}
          >
            Marcar como realizado
          </ActionButton>
        )}
        <div className="ml-auto">
          <DeleteButton
            action={deleteCamp.bind(null, camp.id)}
            title={`Remover ${camp.name}?`}
            description="Remove o acampamento e todas as inscrições. Os cadastros das famílias continuam."
          />
        </div>
      </CardContent>
    </Card>
  );
}

async function ParishesCard({ camp }: { camp: Camp }) {
  const [participants, parishes] = await Promise.all([getCampParticipants(camp.id), parishOptions()]);
  const linked = new Set(camp.parishes.map((link) => link.parishId));
  const editable = camp.status === "draft" || camp.status === "open";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paróquias</CardTitle>
        <CardDescription>
          Cada paróquia forma uma tenda nova com as famílias inscritas por ela.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paróquia</TableHead>
              <TableHead>Tenda</TableHead>
              <TableHead className="text-right">Famílias</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {camp.parishes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Adicione as paróquias deste acampamento.
                </TableCell>
              </TableRow>
            )}
            {camp.parishes.map((link) => {
              const families = participants.filter(
                (p) => p.family.parishId === link.parishId && countsTowardCamp(p.status),
              ).length;
              return (
                <TableRow key={link.parishId}>
                  <TableCell className="font-medium">{link.parish.name}</TableCell>
                  <TableCell>
                    {link.formingTent && (
                      <Link href={`/tendas/${link.formingTent.id}`} className="hover:underline">
                        {tentLabel(link.formingTent)}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{families}</TableCell>
                  <TableCell className="text-right">
                    {editable && (
                      <DeleteButton
                        action={removeCampParish.bind(null, camp.id, link.parishId)}
                        title={`Tirar ${link.parish.name} do acampamento?`}
                        description="Só é possível sem famílias inscritas por esta paróquia. A tenda em formação é removida."
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {editable && (
          <AddSelect
            placeholder="Adicionar paróquia..."
            options={parishes.filter((parish) => !linked.has(parish.value))}
            action={addCampParish.bind(null, camp.id)}
          />
        )}
      </CardContent>
    </Card>
  );
}

async function TentsCard({ camp }: { camp: Camp }) {
  const [participants, available] = await Promise.all([
    getCampParticipants(camp.id),
    tentsAvailableForCamp(camp),
  ]);
  const camperTents = camp.tents.filter((link) => link.role === "camper");
  const editable = camp.status !== "finished";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendas campistas</CardTitle>
        <CardDescription>
          Todas as famílias da tenda entram como campistas; ajuste quem vai na aba Campistas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenda</TableHead>
              <TableHead>Paróquia</TableHead>
              <TableHead className="text-right">Famílias</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {camperTents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Adicione as tendas que vão acampar.
                </TableCell>
              </TableRow>
            )}
            {camperTents.map((link) => (
              <TableRow key={link.tentId}>
                <TableCell>
                  <Link href={`/tendas/${link.tentId}`} className="font-medium hover:underline">
                    {tentLabel(link.tent)}
                  </Link>
                </TableCell>
                <TableCell>{link.tent.parish.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {
                    participants.filter(
                      (p) =>
                        p.role === "camper" && p.family.tentId === link.tentId && countsTowardCamp(p.status),
                    ).length
                  }
                </TableCell>
                <TableCell className="text-right">
                  {editable && (
                    <DeleteButton
                      action={removeCampTent.bind(null, camp.id, link.tentId)}
                      title={`Tirar ${tentLabel(link.tent)} do acampamento?`}
                      description="As famílias desta tenda deixam de ser campistas neste acampamento."
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {editable && (
          <AddSelect
            placeholder="Adicionar tenda..."
            options={available.map((tent) => ({
              value: tent.id,
              label: `${tentLabel(tent)} · ${tent.parish.name}${tent.suggested ? " (sugerida)" : ""}`,
            }))}
            action={addCampTent.bind(null, camp.id)}
          />
        )}
      </CardContent>
    </Card>
  );
}
