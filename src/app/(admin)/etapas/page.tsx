import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listStages } from "@/lib/data/stages";
import { deleteStage } from "./actions";

export default async function StagesPage() {
  const stages = await listStages();

  return (
    <>
      <PageHeader
        title="Etapas"
        description="O caminho que cada tenda percorre, em ordem."
        actions={<Button render={<Link href="/etapas/nova" />}>Nova etapa</Button>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Ordem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {stages.map((stage) => (
            <TableRow key={stage.id}>
              <TableCell className="tabular-nums">{stage.position}</TableCell>
              <TableCell>
                <Link href={`/etapas/${stage.id}`} className="font-medium hover:underline">
                  {stage.name}
                </Link>
                {stage.hasCamp && (
                  <Badge variant="secondary" className="ml-2">
                    Acampamento
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DeleteButton
                  action={deleteStage.bind(null, stage.id)}
                  title={`Remover ${stage.name}?`}
                  description="Só é possível remover etapas que nenhuma tenda ou acampamento usa."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
