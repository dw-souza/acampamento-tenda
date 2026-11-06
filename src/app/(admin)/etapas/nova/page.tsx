import { PageHeader } from "@/components/page-header";
import { listStages } from "@/lib/data/stages";
import { StageForm } from "../stage-form";

export default async function NewStagePage() {
  const stages = await listStages();
  const nextPosition = Math.max(0, ...stages.map((stage) => stage.position)) + 1;
  return (
    <>
      <PageHeader title="Nova etapa" />
      <StageForm id={null} defaultValues={{ name: "", position: nextPosition, hasCamp: false }} />
    </>
  );
}
