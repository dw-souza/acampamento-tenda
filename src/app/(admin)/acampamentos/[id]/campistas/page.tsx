import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type CampParticipant, getCamp, getCampParticipants, toSummaryInput } from "@/lib/data/camps";
import { countsTowardCamp, summarizeCamp, summarizeParticipant } from "@/lib/domain/camp-summary";
import { coupleName, plural, tentLabel } from "@/lib/format/labels";
import { formatMoney } from "@/lib/format/money";
import { participantStatusLabels } from "@/lib/validation/camp";
import { StatusBadge } from "@/components/status-badge";
import { participantStatusTone } from "@/lib/format/status";
import { removeParticipant } from "../../participant-actions";
import { memberOptions } from "../members";
import { AttendanceChecks, NannyControl, StatusSelect } from "./participant-controls";

export default async function CampersPage({ params }: PageProps<"/acampamentos/[id]/campistas">) {
  const { id } = await params;
  const camp = await getCamp(id);
  if (!camp) notFound();
  const participants = (await getCampParticipants(id)).filter((p) => p.role === "camper");

  const groups = new Map<string, { title: string; rows: CampParticipant[] }>();
  for (const participant of participants) {
    const tent = participant.family.tent;
    const key = tent?.id ?? "none";
    const title = tent ? `${tentLabel(tent)} · ${participant.family.parish.name}` : "Sem tenda";
    if (!groups.has(key)) groups.set(key, { title, rows: [] });
    groups.get(key)!.rows.push(participant);
  }
  const sortedGroups = [...groups.values()].sort((a, b) => a.title.localeCompare(b.title));

  // Inscrição, lista de espera e desistência só existem no acampamento aberto.
  const isOpenCamp = camp.stage.formsTents;
  const scheduled = camp.status === "scheduled";
  const count = (status: string) => participants.filter((p) => p.status === status).length;
  const statusSummary = isOpenCamp
    ? [
        plural(count("confirmed"), "inscrita", "inscritas"),
        count("waitlist") > 0 && `${count("waitlist")} na lista de espera`,
        count("cancelled") > 0 && plural(count("cancelled"), "desistiu", "desistiram"),
      ]
        .filter(Boolean)
        .join(" · ")
    : plural(participants.length, "família", "famílias");
  const canRegister = isOpenCamp && scheduled;
  const nannyPending = summarizeCamp(participants.map(toSummaryInput), camp).nannyPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {statusSummary}
          {nannyPending > 0 && (
            <span className="text-amber-700">
              {" "}
              · {plural(nannyPending, "família precisa informar a babá", "famílias precisam informar a babá")}
            </span>
          )}
        </p>
        {canRegister && (
          <Button render={<Link href={`/acampamentos/${camp.id}/inscricao`} />}>Inscrever família</Button>
        )}
      </div>

      {participants.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {camp.stage.formsTents
            ? "Nenhuma família inscrita ainda."
            : "Adicione os tendas campistas na visão geral."}
        </p>
      )}

      {sortedGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>
              {group.title} ({group.rows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Família</TableHead>
                  <TableHead>Quem vai</TableHead>
                  {isOpenCamp && <TableHead>Inscrição</TableHead>}
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.rows
                  .map((participant) => ({ participant, name: coupleName(participant.family.people) }))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(({ participant, name }) => {
                    const members = memberOptions(participant, camp.startDate);
                    const summary = summarizeParticipant(toSummaryInput(participant), camp);
                    return (
                      <TableRow
                        key={participant.id}
                        className={countsTowardCamp(participant.status) ? undefined : "opacity-60"}
                      >
                        <TableCell className="align-top">
                          <Link
                            href={`/familias/${participant.familyId}`}
                            className="font-medium hover:underline"
                          >
                            {name}
                          </Link>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <AttendanceChecks participantId={participant.id} members={members} />
                          {summary.nanny !== "not_needed" && countsTowardCamp(participant.status) && (
                            <NannyControl
                              participantId={participant.id}
                              status={summary.nanny}
                              name={participant.nannyName}
                            />
                          )}
                        </TableCell>
                        {isOpenCamp && (
                          <TableCell className="align-top">
                            {scheduled ? (
                              <StatusSelect participantId={participant.id} status={participant.status} />
                            ) : (
                              <StatusBadge tone={participantStatusTone[participant.status]}>
                                {participantStatusLabels[participant.status]}
                              </StatusBadge>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right align-top tabular-nums">
                          {formatMoney(summary.expectedCents)}
                        </TableCell>
                        <TableCell className="text-right align-top">
                          {scheduled && (
                            <DeleteButton
                              action={removeParticipant.bind(null, participant.id)}
                              title={`Tirar ${name} do acampamento?`}
                              description={
                                camp.stage.formsTents
                                  ? "A inscrição é removida e a família sai do tenda em formação. O cadastro continua."
                                  : "A família deixa de participar deste acampamento. O cadastro continua."
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
