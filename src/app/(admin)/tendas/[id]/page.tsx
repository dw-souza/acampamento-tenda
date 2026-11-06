import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listStages } from "@/lib/data/stages";
import { getTent } from "@/lib/data/tents";
import { coupleName, formatDate, tentLabel, tentStatusLabels } from "@/lib/format/labels";
import { deleteTent, removeTentStage } from "../actions";
import { StageRecordForm } from "./stage-record-form";

export default async function TentPage({ params }: PageProps<"/tendas/[id]">) {
  const { id } = await params;
  const [tent, stages] = await Promise.all([getTent(id), listStages()]);
  if (!tent) notFound();
  const recorded = new Set(tent.stageHistory.map((entry) => entry.stageId));
  const milestoneOptions = stages
    .filter((stage) => !stage.hasCamp && !recorded.has(stage.id))
    .map((stage) => ({ value: stage.id, label: stage.name }));

  const families = tent.families
    .map((family) => ({ ...family, label: coupleName(family.people) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const guardian = families.find((family) => family.id === tent.guardianFamilyId);
  const history = [...tent.stageHistory].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <PageHeader
        title={tentLabel(tent)}
        description={
          <>
            {tent.parish.name} · {tent.currentStage?.name ?? "Sem etapa"}{" "}
            <Badge variant={tent.status === "active" ? "secondary" : "outline"} className="ml-1">
              {tentStatusLabels[tent.status]}
            </Badge>
          </>
        }
        actions={
          <>
            <Button variant="outline" render={<Link href={`/tendas/${tent.id}/editar`} />}>
              Editar
            </Button>
            <DeleteButton
              action={deleteTent.bind(null, tent.id)}
              title={`Remover ${tentLabel(tent)}?`}
              description="As famílias continuam cadastradas, mas ficam sem tenda."
            />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Famílias ({families.length})</CardTitle>
            <Button
              size="sm"
              render={<Link href={`/familias/nova?paroquia=${tent.parishId}&tenda=${tent.id}`} />}
            >
              Nova família
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Casal</TableHead>
                  <TableHead className="text-right">Filhos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {families.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Nenhuma família nesta tenda.
                    </TableCell>
                  </TableRow>
                )}
                {families.map((family) => (
                  <TableRow key={family.id}>
                    <TableCell>
                      <Link href={`/familias/${family.id}`} className="font-medium hover:underline">
                        {family.label}
                      </Link>
                      {family.id === tent.guardianFamilyId && (
                        <Badge variant="secondary" className="ml-2">
                          Guardiões
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {family.people.filter((person) => person.role === "child").length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Encontros</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <dl className="grid gap-2">
                <div>
                  <dt className="text-muted-foreground">Guardiões</dt>
                  <dd>{guardian?.label ?? "Não definidos"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Quando</dt>
                  <dd>{tent.meetingSchedule ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Onde</dt>
                  <dd>{tent.meetingLocation ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Formada em</dt>
                  <dd>{formatDate(tent.formedAt) || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Caminho</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {history.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma etapa registrada.</p>
              ) : (
                <ol className="grid gap-2">
                  {history.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-4">
                      <span>{entry.stage.name}</span>
                      <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
                        {formatDate(entry.date)}
                        {!entry.campId && (
                          <DeleteButton
                            action={removeTentStage.bind(null, tent.id, entry.id)}
                            title={`Remover ${entry.stage.name} do caminho?`}
                            description="A etapa atual da tenda não muda; ajuste-a em Editar se precisar."
                          />
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              {milestoneOptions.length > 0 && (
                <div className="mt-4">
                  <StageRecordForm tentId={tent.id} stageOptions={milestoneOptions} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
