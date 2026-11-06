"use client";

import Link from "next/link";
import { CheckboxField, TextField } from "@/components/form/fields";
import { useActionForm } from "@/components/form/use-action-form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { type StageInput, stageSchema } from "@/lib/validation/stage";
import { saveStage } from "./actions";

export function StageForm({ id, defaultValues }: { id: string | null; defaultValues: StageInput }) {
  const { form, onSubmit, pending } = useActionForm({
    schema: stageSchema,
    defaultValues,
    action: (values) => saveStage(id, values),
  });
  const { control } = form;

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <FieldGroup>
        <TextField control={control} name="name" label="Nome" />
        <TextField
          control={control}
          name="position"
          label="Ordem"
          type="number"
          min={1}
          description="Posição da etapa no caminho (1 = primeira)."
        />
        <CheckboxField control={control} name="hasCamp" label="Esta etapa tem acampamento" />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" render={<Link href="/etapas" />}>
            Cancelar
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
