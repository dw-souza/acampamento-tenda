import { Tent } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SelectFilter } from "@/components/filters/select-filter";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parishOptions } from "@/lib/data/parishes";
import { stageOptions } from "@/lib/data/stages";
import { listTents } from "@/lib/data/tents";
import { tentLabel, tentStatusLabels } from "@/lib/format/labels";
import { StatusBadge } from "@/components/status-badge";
import { tentStatusTone } from "@/lib/format/status";

export default async function TentsPage({ searchParams }: PageProps<"/tendas">) {
  const { paroquia, etapa } = await searchParams;
  const parishId = typeof paroquia === "string" ? paroquia : undefined;
  const stageId = typeof etapa === "string" ? etapa : undefined;
  const [tents, parishes, stages] = await Promise.all([
    listTents({ parishId, stageId }),
    parishOptions(),
    stageOptions(),
  ]);

  return (
    <>
      <PageHeader
        icon={Tent}
        title="Tendas"
        actions={
          <Button render={<Link href={parishId ? `/tendas/nova?paroquia=${parishId}` : "/tendas/nova"} />}>
            Novo tenda
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Suspense>
          <SelectFilter param="paroquia" options={parishes} allLabel="Todas as paróquias" />
          <SelectFilter
            param="etapa"
            options={[...stages, { value: "nenhuma", label: "Sem etapa" }]}
            allLabel="Todas as etapas"
          />
        </Suspense>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenda</TableHead>
            <TableHead>Paróquia</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead className="text-right">Famílias</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tents.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Nenhum tenda encontrado.
              </TableCell>
            </TableRow>
          )}
          {tents.map((tent) => (
            <TableRow key={tent.id}>
              <TableCell>
                <Link href={`/tendas/${tent.id}`} className="font-medium hover:underline">
                  {tentLabel(tent)}
                </Link>
                {tent.status !== "active" && (
                  <StatusBadge tone={tentStatusTone[tent.status]} className="ml-2">
                    {tentStatusLabels[tent.status]}
                  </StatusBadge>
                )}
              </TableCell>
              <TableCell>{tent.parishName}</TableCell>
              <TableCell>{tent.stageName ?? "—"}</TableCell>
              <TableCell className="text-right tabular-nums">{tent.families ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
