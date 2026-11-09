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
import { campLabel, tentLabel } from "@/lib/format/labels";
import { formatMoney } from "@/lib/format/money";
import {
  addCampParish,
  addCampTent,
  concludeCamp,
  deleteCamp,
  removeCampParish,
  removeCampTent,
  reopenCamp,
} from "../actions";
import { StatTile } from "@/components/stat-tile";
import { HeartHandshake, Tent, UsersRound, Wallet } from "lucide-react";
import { plural } from "@/lib/format/labels";

export default async function CampOverviewPage({ params }: PageProps<"/acampamentos/[id]">) {
  const { id } = await params;
  const camp = await getCamp(id);
  if (!camp) notFound();
  const participants = await getCampParticipants(camp.id);
  const totals = summarizeCamp(participants.map(toSummaryInput), camp);
  const campers = summarizeCamp(participants.filter((p) => p.role === "camper").map(toSummaryInput), camp);

  const stats = [
    {
      icon: Tent,
      label: "Campistas",
      value: plural(campers.families, "família", "famílias"),
      detail: camp.expectedFamilies ? `de ${camp.expectedFamilies} previstas` : undefined,
    },
    {
      icon: HeartHandshake,
      label: "Servindo",
      value: plural(totals.families - campers.families, "família", "famílias"),
    },
    {
      icon: UsersRound,
      label: "Pessoas",
      value: totals.adults + totals.children + totals.nannies,
      detail: `${plural(totals.adults, "adulto", "adultos")} · ${plural(totals.children, "filho", "filhos")} · ${plural(totals.nannies, "babá", "babás")}`,
    },
    {
      icon: Wallet,
      label: "Caixa",
      value: formatMoney(totals.paidCents),
      detail: `de ${formatMoney(totals.expectedCents)} esperados`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatTile
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
          />
        ))}
      </div>

      {totals.nannyPending > 0 && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-600/20">
          {plural(totals.nannyPending, "família leva", "famílias levam")} criança com menos de 3 anos e ainda
          não {totals.nannyPending === 1 ? "informou" : "informaram"} a babá. Veja nas abas Campistas e
          Equipes.
        </p>
      )}
      <StatusCard camp={camp} />
      {camp.stage.formsTents ? <ParishesCard camp={camp} /> : <TentsCard camp={camp} />}
    </div>
  );
}

function StatusCard({ camp }: { camp: Camp }) {
  const today = new Date().toISOString().slice(0, 10);
  const scheduled = camp.status === "scheduled";
  const overdue = scheduled && camp.endDate < today;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Situação</CardTitle>
        <CardDescription>
          {scheduled
            ? camp.stage.formsTents
              ? "Agendado. Ao concluir, cada tenda em formação passa a ativo com as famílias inscritas; quem está na lista de espera ou desistiu sai do tenda."
              : `Agendado. Ao concluir, os tendas campistas passam para a etapa ${camp.stage.name} no caminho.`
            : "Realizado. Tendas, equipes e inscrições ficam travados; quem vai e pagamentos continuam editáveis."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        {overdue && (
          <p className="w-full text-sm text-amber-700">
            Este acampamento já passou: conclua para registrar a etapa nos tendas.
          </p>
        )}
        {scheduled ? (
          <ActionButton
            action={concludeCamp.bind(null, camp.id)}
            successMessage="Acampamento concluído."
            confirm={{
              title: "Concluir acampamento?",
              description: camp.stage.formsTents
                ? "Os tendas em formação passam a ativos com as famílias inscritas. Famílias na lista de espera ou que desistiram saem do tenda."
                : `Os tendas campistas passam para a etapa ${camp.stage.name} no caminho.`,
              confirmLabel: "Concluir",
            }}
          >
            Concluir acampamento
          </ActionButton>
        ) : (
          <ActionButton
            variant="outline"
            action={reopenCamp.bind(null, camp.id)}
            successMessage="Conclusão desfeita."
            confirm={{
              title: "Desfazer a conclusão?",
              description: camp.stage.formsTents
                ? "Os tendas voltam a ficar em formação e as famílias da lista de espera ou que desistiram voltam a eles. Só é possível se nenhum tenda avançou depois deste acampamento."
                : "A etapa sai do caminho dos tendas campistas. Só é possível se nenhum deles avançou depois deste acampamento.",
              confirmLabel: "Desfazer",
            }}
          >
            Desfazer conclusão
          </ActionButton>
        )}
        {scheduled && (
          <div className="ml-auto">
            <DeleteButton
              action={deleteCamp.bind(null, camp.id)}
              title={`Remover ${campLabel(camp)}?`}
              description="Remove o acampamento e todas as inscrições. Os cadastros das famílias continuam."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function ParishesCard({ camp }: { camp: Camp }) {
  const [participants, parishes] = await Promise.all([getCampParticipants(camp.id), parishOptions()]);
  const linked = new Set(camp.parishes.map((link) => link.parishId));
  const editable = camp.status === "scheduled";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paróquias</CardTitle>
        <CardDescription>
          Cada paróquia forma um tenda novo com as famílias inscritas por ela.
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
                        description="Só é possível sem famílias inscritas por esta paróquia. O tenda em formação é removido."
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
  const editable = camp.status === "scheduled";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendas campistas</CardTitle>
        <CardDescription>
          Todas as famílias do tenda entram como campistas; ajuste quem vai na aba Campistas.
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
                  Adicione os tendas que vão acampar.
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
                      description="As famílias deste tenda deixam de ser campistas neste acampamento."
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
              label: `${tentLabel(tent)} · ${tent.parish.name}${tent.suggested ? " (sugerido)" : ""}`,
            }))}
            action={addCampTent.bind(null, camp.id)}
          />
        )}
      </CardContent>
    </Card>
  );
}
