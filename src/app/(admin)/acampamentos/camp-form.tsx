"use client";

import Link from "next/link";
import { type Option, SelectField, TextareaField, TextField } from "@/components/form/fields";
import { useActionForm } from "@/components/form/use-action-form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
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
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <SelectField control={control} name="stageId" label="Etapa" options={stageOptions} />
          <TextField uppercase control={control} name="name" label="Nome" placeholder="KERIGMA 2026" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={control} name="startDate" label="Início" type="date" />
          <TextField control={control} name="endDate" label="Fim" type="date" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            control={control}
            name="adultPrice"
            label="Valor por adulto (R$)"
            inputMode="decimal"
          />
          <TextField
            control={control}
            name="childPrice"
            label="Valor por filho (R$)"
            inputMode="decimal"
            description="Menores de 3 anos não pagam."
          />
          <TextField
            control={control}
            name="expectedFamilies"
            label="Famílias previstas"
            type="number"
            min={0}
            description="Só referência; não limita."
          />
        </div>
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
