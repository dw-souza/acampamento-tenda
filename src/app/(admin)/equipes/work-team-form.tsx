"use client";

import Link from "next/link";
import { SelectField, TextareaField, TextField } from "@/components/form/fields";
import { useActionForm } from "@/components/form/use-action-form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { teamKinds, type WorkTeamInput, workTeamSchema } from "@/lib/validation/work-team";
import { saveWorkTeam } from "./actions";

const kindOptions = Object.entries(teamKinds).map(([value, label]) => ({ value, label }));

export function WorkTeamForm({ id, defaultValues }: { id: string | null; defaultValues: WorkTeamInput }) {
  const { form, onSubmit, pending } = useActionForm({
    schema: workTeamSchema,
    defaultValues,
    action: (values) => saveWorkTeam(id, values),
  });
  const { control } = form;

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <FieldGroup>
        <TextField control={control} name="name" label="Nome" />
        <SelectField
          control={control}
          name="kind"
          label="Quem serve"
          options={kindOptions}
          description="Tenda inteira (ex.: cozinha) ou casais de várias tendas (ex.: música)."
        />
        <TextField control={control} name="color" label="Cor" type="color" className="w-24" />
        <TextareaField control={control} name="description" label="Descrição" />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" render={<Link href="/equipes" />}>
            Cancelar
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
