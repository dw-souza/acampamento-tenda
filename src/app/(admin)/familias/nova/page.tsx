import { PageHeader } from "@/components/page-header";
import { parishOptions } from "@/lib/data/parishes";
import { tentOptions } from "@/lib/data/tents";
import { saveFamily } from "../actions";
import { FamilyForm } from "../family-form";
import { newFamilyValues } from "../form-values";

export default async function NewFamilyPage({ searchParams }: PageProps<"/familias/nova">) {
  const { paroquia, tenda } = await searchParams;
  const [parishes, tents] = await Promise.all([parishOptions(), tentOptions()]);

  return (
    <>
      <PageHeader title="Nova família" />
      <FamilyForm
        action={saveFamily.bind(null, null)}
        cancelHref="/familias"
        parishOptions={parishes}
        tentOptions={tents}
        defaultValues={newFamilyValues(
          typeof paroquia === "string" ? paroquia : "",
          typeof tenda === "string" ? tenda : "",
        )}
      />
    </>
  );
}
