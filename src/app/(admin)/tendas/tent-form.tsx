"use client";

import Link from "next/link";
import { type Option, SelectField, TextField } from "@/components/form/fields";
import { useActionForm } from "@/components/form/use-action-form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { tentStatusLabels } from "@/lib/format/labels";
import { type TentInput, tentSchema } from "@/lib/validation/tent";
import { saveTent } from "./actions";

const statusOptions = Object.entries(tentStatusLabels).map(([value, label]) => ({ value, label }));

export function TentForm({
  id,
  defaultValues,
  parishOptions,
  stageOptions,
  guardianOptions,
}: {
  id: string | null;
  defaultValues: TentInput;
  parishOptions: Option[];
  stageOptions: Option[];
  guardianOptions: Option[];
}) {
  const { form, onSubmit, pending } = useActionForm({
    schema: tentSchema,
    defaultValues,
    action: (values) => saveTent(id, values),
  });
  const { control } = form;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <SelectField control={control} name="parishId" label="Paróquia" options={parishOptions} />
          <TextField control={control} name="number" label="Número" type="number" min={1} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField control={control} name="status" label="Situação" options={statusOptions} />
          <SelectField
            control={control}
            name="currentStageId"
            label="Etapa atual"
            options={stageOptions}
            emptyLabel="Nenhuma"
          />
        </div>
        <SelectField
          control={control}
          name="guardianFamilyId"
          label="Guardiões"
          options={guardianOptions}
          emptyLabel="Não definidos"
          description={id ? undefined : "Defina depois de cadastrar as famílias do tenda."}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={control} name="meetingSchedule" label="Dia e horário dos encontros" />
          <TextField uppercase control={control} name="meetingLocation" label="Local dos encontros" />
        </div>
        <TextField control={control} name="formedAt" label="Formado em" type="date" className="w-48" />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" render={<Link href={id ? `/tendas/${id}` : "/tendas"} />}>
            Cancelar
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
