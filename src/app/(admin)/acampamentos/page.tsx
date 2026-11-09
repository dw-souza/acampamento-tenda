import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SelectFilter } from "@/components/filters/select-filter";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { campStageOptions, listCamps } from "@/lib/data/camps";
import { campLabel, formatDate } from "@/lib/format/labels";
import { campStatusTone } from "@/lib/format/status";
import { campStatusLabels } from "@/lib/validation/camp";

export default async function CampsPage({ searchParams }: PageProps<"/acampamentos">) {
  const { etapa } = await searchParams;
  const [camps, stages] = await Promise.all([
    listCamps({ stageId: typeof etapa === "string" ? etapa : undefined }),
    campStageOptions(),
  ]);

  return (
    <>
      <PageHeader
        icon={CalendarDays}
        title="Acampamentos"
        actions={<Button render={<Link href="/acampamentos/novo" />}>Novo acampamento</Button>}
      />
      <div className="mb-4">
        <Suspense>
          <SelectFilter param="etapa" options={stages} allLabel="Todas as etapas" />
        </Suspense>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Acampamento</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Famílias</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {camps.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Nenhum acampamento encontrado.
              </TableCell>
            </TableRow>
          )}
          {camps.map((camp) => (
            <TableRow key={camp.id}>
              <TableCell>
                <Link href={`/acampamentos/${camp.id}`} className="font-medium hover:underline">
                  {campLabel({
                    startDate: camp.startDate,
                    stage: { name: camp.stageName, formsTents: camp.stageFormsTents },
                  })}
                </Link>
                {camp.camperTents && <div className="text-xs text-muted-foreground">{camp.camperTents}</div>}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatDate(camp.startDate)} a {formatDate(camp.endDate)}
              </TableCell>
              <TableCell>
                <StatusBadge tone={campStatusTone[camp.status]}>{campStatusLabels[camp.status]}</StatusBadge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{camp.families ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
