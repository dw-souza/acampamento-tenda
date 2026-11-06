import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { campStageOptions } from "@/lib/data/camps";
import { CampForm } from "../camp-form";

export default async function NewCampPage() {
  const stages = await campStageOptions();
  return (
    <>
      <PageHeader icon={CalendarDays} title="Novo acampamento" />
      <CampForm
        id={null}
        stageOptions={stages}
        defaultValues={{
          stageId: "",
          name: "",
          startDate: "",
          endDate: "",
          adultPrice: "125,00",
          childPrice: "25,00",
          serverAdultPrice: "125,00",
          serverChildPrice: "25,00",
          expectedFamilies: "",
          notes: "",
        }}
      />
    </>
  );
}
