import Link from "next/link";
import { notFound } from "next/navigation";
import { AddCombobox } from "@/components/add-combobox";
import { AddSelect } from "@/components/add-select";
import { DeleteButton } from "@/components/delete-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  familiesAvailableForCamp,
  getCamp,
  getCampParticipants,
  tentsAvailableForCamp,
  toSummaryInput,
} from "@/lib/data/camps";
import { listWorkTeams } from "@/lib/data/work-teams";
import { summarizeCamp } from "@/lib/domain/camp-summary";
import { coupleName, peopleSummary, tentLabel } from "@/lib/format/labels";
import { teamKinds } from "@/lib/validation/work-team";
import { removeParticipant } from "../../participant-actions";
import { addTeamFamily, addTeamTent, removeTeamTent } from "../../team-actions";
import { AttendanceChecks } from "../campistas/participant-controls";
import { memberOptions } from "../members";
import { CoordinatorCheck } from "./coordinator-check";

export default async function CampTeamsPage({ params }: PageProps<"/acampamentos/[id]/equipes">) {
  const { id } = await params;
  const camp = await getCamp(id);
  if (!camp) notFound();

  const [participants, teams, tents, families] = await Promise.all([
    getCampParticipants(id),
    listWorkTeams(),
    tentsAvailableForCamp(camp),
    familiesAvailableForCamp(id),
  ]);
  const servers = participants.filter((participant) => participant.role === "server");
  const editable = camp.status !== "finished";
  const tentOptions = tents.map((tent) => ({
    value: tent.id,
    label: `${tentLabel(tent)} · ${tent.parish.name}`,
  }));
  const total = summarizeCamp(servers.map(toSummaryInput), camp);
  const staffed = new Set(servers.map((participant) => participant.teamId));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Servindo: {peopleSummary(total)}
        {total.toddlers > 0 && ` (${total.toddlers} com pajem)`}
      </p>

      {[...teams]
        .sort((a, b) => Number(!staffed.has(a.id)) - Number(!staffed.has(b.id)))
        .map((team) => {
          const members = servers
            .filter((participant) => participant.teamId === team.id)
            .map((participant) => ({
              participant,
              name: coupleName(participant.family.people),
            }))
            .sort(
              (a, b) =>
                Number(b.participant.isCoordinator) - Number(a.participant.isCoordinator) ||
                a.name.localeCompare(b.name),
            );
          const teamTents = camp.tents.filter((link) => link.role === "server" && link.teamId === team.id);
          const summary = summarizeCamp(
            members.map(({ participant }) => toSummaryInput(participant)),
            camp,
          );

          return (
            <Card key={team.id} size={members.length === 0 ? "sm" : "default"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full border"
                    style={{ backgroundColor: team.color ?? undefined }}
                    aria-hidden
                  />
                  {team.name}
                  <Badge variant="outline">{teamKinds[team.kind]}</Badge>
                </CardTitle>
                {members.length > 0 && <CardDescription>{peopleSummary(summary)}</CardDescription>}
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {teamTents.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {teamTents.map((link) => (
                      <span
                        key={link.tentId}
                        className="flex items-center gap-1 rounded-md border py-0.5 pr-0.5 pl-2 text-sm"
                      >
                        {tentLabel(link.tent)} · {link.tent.parish.name}
                        {editable && (
                          <DeleteButton
                            action={removeTeamTent.bind(null, camp.id, link.tentId)}
                            title={`Tirar ${tentLabel(link.tent)} da ${team.name}?`}
                            description="As famílias desta tenda deixam de servir nesta equipe."
                          />
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {members.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Família</TableHead>
                        <TableHead>Quem vai</TableHead>
                        <TableHead className="w-20 text-center">Coord.</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map(({ participant, name }) => (
                        <TableRow key={participant.id}>
                          <TableCell className="align-top">
                            <Link
                              href={`/familias/${participant.familyId}`}
                              className="font-medium hover:underline"
                            >
                              {name}
                            </Link>
                            {participant.family.tent && (
                              <div className="text-xs text-muted-foreground">
                                {tentLabel(participant.family.tent)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="align-top whitespace-normal">
                            <AttendanceChecks
                              participantId={participant.id}
                              members={memberOptions(participant, camp.startDate)}
                            />
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <CoordinatorCheck
                              participantId={participant.id}
                              checked={participant.isCoordinator}
                            />
                          </TableCell>
                          <TableCell className="text-right align-top">
                            {editable && (
                              <DeleteButton
                                action={removeParticipant.bind(null, participant.id)}
                                title={`Tirar ${name} da ${team.name}?`}
                                description="A família deixa de servir neste acampamento. O cadastro continua."
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {editable && (
                  <div className="flex flex-wrap gap-2">
                    {team.kind === "tent" && (
                      <AddSelect
                        placeholder="Tenda inteira..."
                        label="Adicionar tenda"
                        options={tentOptions}
                        action={addTeamTent.bind(null, camp.id, team.id)}
                      />
                    )}
                    <AddCombobox
                      placeholder="Buscar casal..."
                      emptyText="Nenhuma família disponível."
                      options={families}
                      action={addTeamFamily.bind(null, camp.id, team.id)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
