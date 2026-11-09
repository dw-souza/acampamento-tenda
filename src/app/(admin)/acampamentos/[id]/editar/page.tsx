import { notFound } from "next/navigation";
import { campStageOptions, getCamp } from "@/lib/data/camps";
import { centsToInput } from "@/lib/format/money";
import { CampForm } from "../../camp-form";

export default async function EditCampPage({ params }: PageProps<"/acampamentos/[id]/editar">) {
  const { id } = await params;
  const [camp, stages] = await Promise.all([getCamp(id), campStageOptions()]);
  if (!camp) notFound();

  return (
    <CampForm
      id={camp.id}
      stageOptions={stages}
      defaultValues={{
        stageId: camp.stageId,
        startDate: camp.startDate,
        endDate: camp.endDate,
        adultPrice: centsToInput(camp.adultPriceCents),
        childPrice: centsToInput(camp.childPriceCents),
        serverAdultPrice: centsToInput(camp.serverAdultPriceCents),
        serverChildPrice: centsToInput(camp.serverChildPriceCents),
        expectedFamilies: camp.expectedFamilies ?? "",
        notes: camp.notes ?? "",
      }}
    />
  );
}
