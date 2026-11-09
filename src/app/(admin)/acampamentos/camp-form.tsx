"use client";

import Link from "next/link";
import { type Option, SelectField, TextareaField, TextField } from "@/components/form/fields";
import { useActionForm } from "@/components/form/use-action-form";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { type CampInput, campSchema } from "@/lib/validation/camp";
import { saveCamp } from "./actions";

export function CampForm({
  id,
  defaultValues,
  stageOptions,
}: {
  id: string | null;
  defaultValues: CampInput;
  stageOptions: Option[];
}) {
  const { form, onSubmit, pending } = useActionForm({
    schema: campSchema,
    defaultValues,
    action: (values) => saveCamp(id, values),
  });
  const { control } = form;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            control={control}
            name="stageId"
            label="Etapa"
            options={stageOptions}
            description="O nome do acampamento é a etapa e a data de início."
          />
          <TextField control={control} name="startDate" label="Início" type="date" />
          <TextField control={control} name="endDate" label="Fim" type="date" />
        </div>
        <FieldSet>
          <FieldLegend variant="label">Valores por pessoa (R$)</FieldLegend>
          <FieldDescription>
            Menores de 3 anos não pagam. O pagamento é um pedido, nunca uma condição.
          </FieldDescription>
          <div className="grid gap-4 sm:grid-cols-4">
            <TextField control={control} name="adultPrice" label="Adulto campista" inputMode="decimal" />
            <TextField control={control} name="childPrice" label="Filho campista" inputMode="decimal" />
            <TextField control={control} name="serverAdultPrice" label="Adulto servo" inputMode="decimal" />
            <TextField control={control} name="serverChildPrice" label="Filho servo" inputMode="decimal" />
          </div>
        </FieldSet>
        <TextField
          control={control}
          name="expectedFamilies"
          label="Famílias campistas previstas"
          type="number"
          min={0}
          className="sm:w-64"
          description="Só referência; não limita."
        />
        <TextareaField control={control} name="notes" label="Observações" />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" render={<Link href={id ? `/acampamentos/${id}` : "/acampamentos"} />}>
            Cancelar
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
