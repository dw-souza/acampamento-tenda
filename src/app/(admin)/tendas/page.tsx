import Link from "next/link";
import { Suspense } from "react";
import { SelectFilter } from "@/components/filters/select-filter";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parishOptions } from "@/lib/data/parishes";
import { listTents } from "@/lib/data/tents";
import { tentLabel, tentStatusLabels } from "@/lib/format/labels";

export default async function TentsPage({ searchParams }: PageProps<"/tendas">) {
  const { paroquia } = await searchParams;
  const parishId = typeof paroquia === "string" ? paroquia : undefined;
  const [tents, parishes] = await Promise.all([listTents({ parishId }), parishOptions()]);

  return (
    <>
      <PageHeader
        title="Tendas"
        actions={
          <Button render={<Link href={parishId ? `/tendas/nova?paroquia=${parishId}` : "/tendas/nova"} />}>
            Nova tenda
          </Button>
        }
      />
      <div className="mb-4">
        <Suspense>
          <SelectFilter param="paroquia" options={parishes} allLabel="Todas as paróquias" />
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
                Nenhuma tenda encontrada.
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
                  <Badge variant="outline" className="ml-2">
                    {tentStatusLabels[tent.status]}
                  </Badge>
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
