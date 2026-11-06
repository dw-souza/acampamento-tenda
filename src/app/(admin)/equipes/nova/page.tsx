import { PageHeader } from "@/components/page-header";
import { WorkTeamForm } from "../work-team-form";

export default function NewWorkTeamPage() {
  return (
    <>
      <PageHeader title="Nova equipe" />
      <WorkTeamForm id={null} defaultValues={{ name: "", kind: "tent", color: "#3B82F6", description: "" }} />
    </>
  );
}
