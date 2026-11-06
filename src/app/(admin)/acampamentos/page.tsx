import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listCamps } from "@/lib/data/camps";
import { formatDate } from "@/lib/format/labels";
import { campStatusLabels } from "@/lib/validation/camp";
import { StatusBadge } from "@/components/status-badge";
import { campStatusTone } from "@/lib/format/status";

export default async function CampsPage() {
  const camps = await listCamps();

  return (
    <>
      <PageHeader
        icon={CalendarDays}
        title="Acampamentos"
        actions={<Button render={<Link href="/acampamentos/novo" />}>Novo acampamento</Button>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead>Datas</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Famílias</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {camps.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Nenhum acampamento cadastrado.
              </TableCell>
            </TableRow>
          )}
          {camps.map((camp) => (
            <TableRow key={camp.id}>
              <TableCell>
                <Link href={`/acampamentos/${camp.id}`} className="font-medium hover:underline">
                  {camp.name}
                </Link>
              </TableCell>
              <TableCell>{camp.stageName}</TableCell>
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
