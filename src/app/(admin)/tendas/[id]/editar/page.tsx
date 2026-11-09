import { Tent } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { parishOptions } from "@/lib/data/parishes";
import { stageOptions } from "@/lib/data/stages";
import { getTent } from "@/lib/data/tents";
import { coupleName, tentLabel } from "@/lib/format/labels";
import { TentForm } from "../../tent-form";

export default async function EditTentPage({ params }: PageProps<"/tendas/[id]/editar">) {
  const { id } = await params;
  const [tent, parishes, stages] = await Promise.all([getTent(id), parishOptions(), stageOptions()]);
  if (!tent) notFound();

  const guardianOptions = tent.families.map((family) => ({
    value: family.id,
    label: coupleName(family.people),
  }));

  return (
    <>
      <PageHeader icon={Tent} title={`Editar ${tentLabel(tent)}`} description={tent.parish.name} />
      <TentForm
        id={tent.id}
        parishOptions={parishes}
        stageOptions={stages}
        guardianOptions={guardianOptions}
        defaultValues={{
          parishId: tent.parishId,
          number: tent.number,
          status: tent.status,
          currentStageId: tent.currentStageId ?? "",
          guardianFamilyId: tent.guardianFamilyId ?? "",
          meetingSchedule: tent.meetingSchedule ?? "",
          meetingLocation: tent.meetingLocation ?? "",
          formedAt: tent.formedAt ?? "",
        }}
      />
    </>
  );
}
