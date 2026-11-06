import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listWorkTeams } from "@/lib/data/work-teams";
import { teamKinds } from "@/lib/validation/work-team";
import { deleteWorkTeam } from "./actions";

export default async function WorkTeamsPage() {
  const teams = await listWorkTeams();

  return (
    <>
      <PageHeader
        title="Equipes de trabalho"
        actions={<Button render={<Link href="/equipes/nova" />}>Nova equipe</Button>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Quem serve</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <Link href={`/equipes/${team.id}`} className="flex items-center gap-2 font-medium hover:underline">
                  <span
                    className="size-3 rounded-full border"
                    style={{ backgroundColor: team.color ?? undefined }}
                    aria-hidden
                  />
                  {team.name}
                </Link>
              </TableCell>
              <TableCell>{teamKinds[team.kind]}</TableCell>
              <TableCell className="text-muted-foreground">{team.description}</TableCell>
              <TableCell className="text-right">
                <DeleteButton
                  action={deleteWorkTeam.bind(null, team.id)}
                  title={`Remover ${team.name}?`}
                  description="Equipes já usadas em acampamentos não podem ser removidas."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
