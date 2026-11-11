import { HeartHandshake } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getWorkTeam } from "@/lib/data/work-teams";
import { WorkTeamForm } from "../work-team-form";

export default async function EditWorkTeamPage({ params }: PageProps<"/equipes/[id]">) {
  const { id } = await params;
  const team = await getWorkTeam(id);
  if (!team) notFound();

  return (
    <>
      <PageHeader icon={HeartHandshake} title={team.name} />
      <WorkTeamForm
        id={team.id}
        defaultValues={{
          name: team.name,
          kind: team.kind,
          highlight: team.highlight,
          color: team.color ?? "#3B82F6",
          description: team.description ?? "",
        }}
      />
    </>
  );
}
