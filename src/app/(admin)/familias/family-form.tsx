"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { type Control, useFieldArray, useWatch } from "react-hook-form";
import { type Option, SelectField, TextareaField, TextField } from "@/components/form/fields";
import { useActionForm } from "@/components/form/use-action-form";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { personStatusLabels } from "@/lib/format/labels";
import type { ActionResult } from "@/lib/action-result";
import { type FamilyData, type FamilyInput, familySchema } from "@/lib/validation/family";

type FamilyControl = Control<FamilyInput, unknown, FamilyData>;

const statusOptions = Object.entries(personStatusLabels).map(([value, label]) => ({ value, label }));
const contactOptions = [
  { value: "husband", label: "Esposo" },
  { value: "wife", label: "Esposa" },
];

export const emptyChild = {
  id: "",
  fullName: "",
  badgeName: "",
  birthDate: "",
  dietaryRestrictions: "",
  specialNeeds: "",
  status: "active",
} satisfies FamilyInput["children"][number];

export function FamilyForm({
  action,
  defaultValues,
  parishOptions,
  tentOptions,
  cancelHref,
  submitLabel = "Salvar",
}: {
  action: (values: FamilyInput) => Promise<ActionResult>;
  defaultValues: FamilyInput;
  parishOptions: Option[];
  /** Sem tendas: a tenda é definida pelo servidor (ex.: inscrição no Kerigma). */
  tentOptions?: (Option & { parishId: string })[];
  cancelHref: string;
  submitLabel?: string;
}) {
  const { form, onSubmit, pending } = useActionForm({ schema: familySchema, defaultValues, action });
  const { control, getValues, setValue } = form;
  const children = useFieldArray({ control, name: "children" });

  const parishId = useWatch({ control, name: "parishId" });
  const parishTents = useMemo(
    () => tentOptions?.filter((tent) => tent.parishId === parishId) ?? [],
    [tentOptions, parishId],
  );

  // Ao trocar de paróquia, a tenda escolhida deixa de valer.
  useEffect(() => {
    if (!tentOptions) return;
    const tentId = getValues("tentId");
    if (tentId && !parishTents.some((tent) => tent.value === tentId)) setValue("tentId", "");
  }, [tentOptions, parishTents, getValues, setValue]);

  return (
    <form onSubmit={onSubmit} className="max-w-3xl">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Família</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField control={control} name="parishId" label="Paróquia" options={parishOptions} />
            {tentOptions && (
              <SelectField
                control={control}
                name="tentId"
                label="Tenda"
                options={parishTents}
                emptyLabel="Sem tenda"
              />
            )}
            <TextField control={control} name="weddingDate" label="Data de casamento" type="date" />
            <SelectField
              control={control}
              name="mainContactRole"
              label="Contato principal"
              options={contactOptions}
            />
          </div>
        </FieldSet>

        <FieldSeparator />
        <SpouseFields control={control} role="husband" title="Esposo" />
        <FieldSeparator />
        <SpouseFields control={control} role="wife" title="Esposa" />
        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Filhos</FieldLegend>
          {children.fields.map((child, index) => (
            <div key={child.id} className="relative rounded-lg border p-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                aria-label="Remover filho"
                onClick={() => children.remove(index)}
              >
                <X />
              </Button>
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr_10rem]">
                <TextField uppercase control={control} name={`children.${index}.fullName`} label="Nome completo" />
                <TextField uppercase control={control} name={`children.${index}.badgeName`} label="Nome no crachá" />
                <TextField control={control} name={`children.${index}.birthDate`} label="Nascimento" type="date" />
                <TextField
                  control={control}
                  name={`children.${index}.dietaryRestrictions`}
                  label="Restrição alimentar"
                />
                <TextField
                  control={control}
                  name={`children.${index}.specialNeeds`}
                  label="Necessidades especiais"
                  className="sm:col-span-2"
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" className="w-fit" onClick={() => children.append(emptyChild)}>
            <Plus /> Adicionar filho
          </Button>
        </FieldSet>

        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Endereço</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <TextField uppercase control={control} name="address" label="Endereço" />
            <TextField uppercase control={control} name="neighborhood" label="Bairro" />
          </div>
          <div className="grid gap-4 sm:grid-cols-[2fr_6rem_10rem]">
            <TextField uppercase control={control} name="city" label="Cidade" />
            <TextField uppercase control={control} name="state" label="UF" maxLength={2} />
            <TextField control={control} name="zipCode" label="CEP" />
          </div>
        </FieldSet>

        <TextareaField control={control} name="notes" label="Observações" />

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : submitLabel}
          </Button>
          <Button variant="outline" render={<Link href={cancelHref} />}>
            Cancelar
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

function SpouseFields({
  control,
  role,
  title,
}: {
  control: FamilyControl;
  role: "husband" | "wife";
  title: string;
}) {
  return (
    <FieldSet>
      <FieldLegend>{title}</FieldLegend>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <TextField uppercase control={control} name={`${role}.fullName`} label="Nome completo" />
        <TextField uppercase control={control} name={`${role}.badgeName`} label="Nome no crachá" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField control={control} name={`${role}.phone`} label="Telefone" type="tel" />
        <TextField control={control} name={`${role}.email`} label="E-mail" type="email" />
        <TextField control={control} name={`${role}.birthDate`} label="Nascimento" type="date" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField uppercase control={control} name={`${role}.profession`} label="Profissão" />
        <TextField control={control} name={`${role}.dietaryRestrictions`} label="Restrição alimentar" />
        <SelectField control={control} name={`${role}.status`} label="Situação" options={statusOptions} />
      </div>
      <TextField control={control} name={`${role}.specialNeeds`} label="Necessidades especiais" />
    </FieldSet>
  );
}
