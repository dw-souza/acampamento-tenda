import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCamp, getCampParticipants, toSummaryInput } from "@/lib/data/camps";
import { countsTowardCamp, summarizeParticipant } from "@/lib/domain/camp-summary";
import {
  type PaymentStatus,
  paymentStatus,
  paymentStatusLabels,
  treasuryTotals,
} from "@/lib/domain/treasury";
import { coupleName, plural, tentLabel } from "@/lib/format/labels";
import { formatMoney } from "@/lib/format/money";
import { PaymentEditor } from "./payment-editor";

const roleFilter = [
  { value: "campistas", label: "Campistas" },
  { value: "servos", label: "Servos" },
];
const statusFilter: { value: PaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Não pagou" },
  { value: "partial", label: "Parcial" },
  { value: "paid", label: "Pago" },
];
const statusBadge: Record<PaymentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  paid: "default",
  partial: "secondary",
  unpaid: "outline",
  free: "outline",
};

export default async function TreasuryPage({
  params,
  searchParams,
}: PageProps<"/acampamentos/[id]/tesouraria">) {
  const { id } = await params;
  const { funcao, situacao, q } = await searchParams;
  const camp = await getCamp(id);
  if (!camp) notFound();
  const participants = await getCampParticipants(id);

  // Quem cancelou ou está na espera só aparece se já pagou algo.
  const rows = participants
    .filter((participant) => countsTowardCamp(participant.status) || participant.paidCents > 0)
    .map((participant) => {
      const summary = summarizeParticipant(toSummaryInput(participant), camp);
      return {
        participant,
        name: coupleName(participant.family.people),
        summary,
        status: paymentStatus(summary.expectedCents, participant.paidCents),
      };
    });
  const totals = treasuryTotals(
    rows.map(({ participant, summary }) => ({
      role: participant.role,
      method: participant.paymentMethod,
      expectedCents: summary.expectedCents,
      paidCents: participant.paidCents,
    })),
  );

  const search = typeof q === "string" ? q.trim().toLowerCase() : "";
  const visible = rows
    .filter(({ participant }) =>
      funcao === "campistas"
        ? participant.role === "camper"
        : funcao === "servos"
          ? participant.role === "server"
          : true,
    )
    .filter(({ status }) => (typeof situacao === "string" ? status === situacao : true))
    .filter(({ participant }) =>
      search
        ? participant.family.people.some((person) =>
            person.fullName
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .toLowerCase()
              .includes(search.normalize("NFD").replace(/\p{Diacritic}/gu, "")),
          )
        : true,
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const cards = [
    {
      label: "Esperado",
      value: formatMoney(totals.expectedCents),
      detail: `Campistas ${formatMoney(totals.byRole.camper.expectedCents)} · Servos ${formatMoney(totals.byRole.server.expectedCents)}`,
    },
    {
      label: "Arrecadado",
      value: formatMoney(totals.paidCents),
      detail: `PIX ${formatMoney(totals.byMethod.pix)} · Dinheiro ${formatMoney(totals.byMethod.cash)}`,
    },
    {
      label: "Falta receber",
      value: formatMoney(totals.missingCents),
      detail: plural(
        rows.filter((row) => row.status === "unpaid" || row.status === "partial").length,
        "família",
        "famílias",
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} size="sm">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl! tabular-nums">{card.value}</CardTitle>
              <CardDescription className="text-xs">{card.detail}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Suspense>
          <SearchFilter placeholder="Buscar por nome..." />
          <SelectFilter param="funcao" options={roleFilter} allLabel="Campistas e servos" />
          <SelectFilter param="situacao" options={statusFilter} allLabel="Qualquer situação" />
        </Suspense>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Família</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="text-right">Esperado</TableHead>
            <TableHead className="text-right">Pago</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Nenhuma família encontrada.
              </TableCell>
            </TableRow>
          )}
          {visible.map(({ participant, name, summary, status }) => (
            <TableRow key={participant.id}>
              <TableCell>
                <Link href={`/familias/${participant.familyId}`} className="font-medium hover:underline">
                  {name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {participant.family.tent ? tentLabel(participant.family.tent) : "Sem tenda"} ·{" "}
                  {plural(summary.adults, "adulto", "adultos")}
                  {summary.children > 0 && ` · ${plural(summary.children, "filho", "filhos")}`}
                </div>
              </TableCell>
              <TableCell>
                {participant.role === "camper" ? "Campista" : (participant.team?.name ?? "Servo")}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(summary.expectedCents)}</TableCell>
              <TableCell>
                <PaymentEditor
                  participantId={participant.id}
                  paidCents={participant.paidCents}
                  method={participant.paymentMethod}
                  expectedCents={summary.expectedCents}
                />
              </TableCell>
              <TableCell>
                <Badge variant={statusBadge[status]}>{paymentStatusLabels[status]}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
