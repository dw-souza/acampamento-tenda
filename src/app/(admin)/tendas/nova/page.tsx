import { PageHeader } from "@/components/page-header";
import { parishOptions } from "@/lib/data/parishes";
import { stageOptions } from "@/lib/data/stages";
import { TentForm } from "../tent-form";

export default async function NewTentPage({ searchParams }: PageProps<"/tendas/nova">) {
  const { paroquia } = await searchParams;
  const [parishes, stages] = await Promise.all([parishOptions(), stageOptions()]);

  return (
    <>
      <PageHeader title="Nova tenda" />
      <TentForm
        id={null}
        parishOptions={parishes}
        stageOptions={stages}
        guardianOptions={[]}
        defaultValues={{
          parishId: typeof paroquia === "string" ? paroquia : "",
          number: "",
          name: "",
          status: "active",
          currentStageId: "",
          guardianFamilyId: "",
          meetingSchedule: "",
          meetingLocation: "",
          formedAt: "",
        }}
      />
    </>
  );
}
