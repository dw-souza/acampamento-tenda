"use client";

// Campos ligados ao react-hook-form. Todos usam Controller para que o valor
// do formulário seja sempre string ("" = vazio); o schema zod converte depois.
import { type ComponentProps } from "react";
import { type Control, Controller, type FieldValues, type Path } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// TOut: tipo depois do parse do zod (ex.: "" -> null); o campo só lida com o input T.
type BaseProps<T extends FieldValues, TOut> = {
  control: Control<T, unknown, TOut>;
  name: Path<T>;
  label: string;
  description?: string;
  className?: string;
};

export function TextField<T extends FieldValues, TOut>({
  control,
  name,
  label,
  description,
  className,
  uppercase,
  ...inputProps
}: BaseProps<T, TOut> &
  Omit<ComponentProps<typeof Input>, "name"> & {
    /** Mostra em maiúsculas enquanto digita (o schema grava em maiúsculas). */
    uppercase?: boolean;
  }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...inputProps}
            {...field}
            id={name}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
            className={uppercase ? "uppercase" : undefined}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues, TOut>({
  control,
  name,
  label,
  description,
  className,
}: BaseProps<T, TOut>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Textarea {...field} id={name} value={field.value ?? ""} aria-invalid={fieldState.invalid} />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export type Option = { value: string; label: string };

export function SelectField<T extends FieldValues, TOut>({
  control,
  name,
  label,
  description,
  className,
  options,
  placeholder = "Selecione",
  emptyLabel,
}: BaseProps<T, TOut> & {
  options: Option[];
  placeholder?: string;
  /** Se informado, adiciona uma opção vazia com este rótulo. */
  emptyLabel?: string;
}) {
  const items = emptyLabel ? [{ value: null, label: emptyLabel }, ...options] : options;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            items={items}
            value={field.value || null}
            onValueChange={(value) => field.onChange(value ?? "")}
          >
            <SelectTrigger id={name} className="w-full" aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value ?? "__empty"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function CheckboxField<T extends FieldValues, TOut>({
  control,
  name,
  label,
  description,
  className,
}: BaseProps<T, TOut>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" className={className}>
          <Checkbox id={name} checked={!!field.value} onCheckedChange={field.onChange} />
          <FieldLabel htmlFor={name} className="font-normal">
            {label}
          </FieldLabel>
          {description && <FieldDescription>{description}</FieldDescription>}
        </Field>
      )}
    />
  );
}
