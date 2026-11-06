import { notFound } from "next/navigation";
import { FamilyForm } from "@/app/(admin)/familias/family-form";
import { newFamilyValues } from "@/app/(admin)/familias/form-values";
import { getCamp } from "@/lib/data/camps";
import { registerFamily } from "../../participant-actions";

export default async function RegisterFamilyPage({ params }: PageProps<"/acampamentos/[id]/inscricao">) {
  const { id } = await params;
  const camp = await getCamp(id);
  if (!camp || !camp.stage.formsTents) notFound();

  const parishOptions = camp.parishes.map((link) => ({ value: link.parishId, label: link.parish.name }));
  if (parishOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Adicione as paróquias do acampamento na visão geral antes de inscrever famílias.
      </p>
    );
  }

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold">Inscrever família</h2>
      <FamilyForm
        action={registerFamily.bind(null, camp.id)}
        parishOptions={parishOptions}
        cancelHref={`/acampamentos/${camp.id}/campistas`}
        submitLabel="Inscrever"
        defaultValues={newFamilyValues(parishOptions.length === 1 ? parishOptions[0].value : "")}
      />
    </>
  );
}
