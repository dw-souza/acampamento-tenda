"use client";

import Link from "next/link";
import { CheckboxField, TextField } from "@/components/form/fields";
import { useActionForm } from "@/components/form/use-action-form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { type ParishInput, parishSchema } from "@/lib/validation/parish";
import { saveParish } from "./actions";

export function ParishForm({ id, defaultValues }: { id: string | null; defaultValues: ParishInput }) {
  const { form, onSubmit, pending } = useActionForm({
    schema: parishSchema,
    defaultValues,
    action: (values) => saveParish(id, values),
  });
  const { control } = form;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <FieldGroup>
        <TextField uppercase control={control} name="name" label="Nome" />
        <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
          <TextField uppercase control={control} name="city" label="Cidade" />
          <TextField uppercase control={control} name="state" label="UF" maxLength={2} />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
          <TextField uppercase control={control} name="address" label="Endereço" />
          <TextField control={control} name="zipCode" label="CEP" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={control} name="phone" label="Telefone" />
          <TextField control={control} name="email" label="E-mail" type="email" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField uppercase control={control} name="responsibleName" label="Responsável" />
          <TextField control={control} name="responsiblePhone" label="Telefone do responsável" />
        </div>
        <CheckboxField control={control} name="active" label="Ativa" />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" render={<Link href="/paroquias" />}>
            Cancelar
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
