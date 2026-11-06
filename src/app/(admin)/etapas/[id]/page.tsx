import { Route } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getStage } from "@/lib/data/stages";
import { StageForm } from "../stage-form";

export default async function EditStagePage({ params }: PageProps<"/etapas/[id]">) {
  const { id } = await params;
  const stage = await getStage(id);
  if (!stage) notFound();

  return (
    <>
      <PageHeader icon={Route} title={stage.name} />
      <StageForm
        id={stage.id}
        defaultValues={{
          name: stage.name,
          position: stage.position,
          hasCamp: stage.hasCamp,
          formsTents: stage.formsTents,
        }}
      />
    </>
  );
}
