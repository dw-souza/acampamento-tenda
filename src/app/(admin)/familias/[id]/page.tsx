import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { getFamily } from "@/lib/data/families";
import { parishOptions } from "@/lib/data/parishes";
import { tentOptions } from "@/lib/data/tents";
import { coupleName, tentLabel } from "@/lib/format/labels";
import { deleteFamily } from "../actions";
import { FamilyForm } from "../family-form";
import { familyValues } from "../form-values";

export default async function FamilyPage({ params }: PageProps<"/familias/[id]">) {
  const { id } = await params;
  const [family, parishes, tents] = await Promise.all([getFamily(id), parishOptions(), tentOptions()]);
  if (!family) notFound();

  const name = coupleName(family.people);
  return (
    <>
      <PageHeader
        title={name}
        description={[family.parish.name, family.tent && tentLabel(family.tent)].filter(Boolean).join(" · ")}
        actions={
          <DeleteButton
            action={deleteFamily.bind(null, family.id)}
            title={`Remover ${name}?`}
            description="Remove a família, os filhos e as participações em acampamentos. Para quem deixou a tenda, prefira marcar a situação como “Saiu”."
          />
        }
      />
      <FamilyForm
        id={family.id}
        parishOptions={parishes}
        tentOptions={tents}
        defaultValues={familyValues(family)}
      />
    </>
  );
}
