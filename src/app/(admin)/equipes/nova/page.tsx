import { HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WorkTeamForm } from "../work-team-form";

export default function NewWorkTeamPage() {
  return (
    <>
      <PageHeader icon={HeartHandshake} title="Nova equipe" />
      <WorkTeamForm
        id={null}
        defaultValues={{ name: "", kind: "tent", highlight: false, color: "#3B82F6", description: "" }}
      />
    </>
  );
}
