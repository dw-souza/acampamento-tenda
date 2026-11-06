import { Church } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listParishes } from "@/lib/data/parishes";
import { deleteParish } from "./actions";
import { StatusBadge } from "@/components/status-badge";

export default async function ParishesPage() {
  const parishes = await listParishes();

  return (
    <>
      <PageHeader
        icon={Church}
        title="Paróquias"
        actions={<Button render={<Link href="/paroquias/nova" />}>Nova paróquia</Button>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {parishes.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Nenhuma paróquia cadastrada.
              </TableCell>
            </TableRow>
          )}
          {parishes.map((parish) => (
            <TableRow key={parish.id}>
              <TableCell>
                <Link href={`/paroquias/${parish.id}`} className="font-medium hover:underline">
                  {parish.name}
                </Link>
                {!parish.active && (
                  <StatusBadge tone="neutral" className="ml-2">
                    Inativa
                  </StatusBadge>
                )}
              </TableCell>
              <TableCell>
                {parish.city}/{parish.state}
              </TableCell>
              <TableCell>{parish.responsibleName}</TableCell>
              <TableCell className="text-right">
                <DeleteButton
                  action={deleteParish.bind(null, parish.id)}
                  title={`Remover ${parish.name}?`}
                  description="Só é possível remover paróquias sem tendas, famílias ou acampamentos."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
