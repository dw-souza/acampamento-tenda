"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { type DefaultValues, type FieldValues, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import type { ActionResult } from "@/lib/action-result";

/**
 * react-hook-form + zod + Server Action. O schema valida no cliente e a action
 * valida de novo no servidor. Em caso de sucesso a action faz redirect.
 */
export function useActionForm<TSchema extends z.ZodType<unknown, FieldValues>>({
  schema,
  defaultValues,
  action,
}: {
  schema: TSchema;
  defaultValues: DefaultValues<z.input<TSchema>>;
  action: (values: z.input<TSchema>) => Promise<ActionResult>;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    // zodResolver não infere tipos a partir de um schema genérico; o cast só fixa input/output.
    resolver: zodResolver(schema) as unknown as Resolver<z.input<TSchema>, unknown, z.output<TSchema>>,
    defaultValues,
  });

  const onSubmit = form.handleSubmit((_parsed, event) => {
    event?.preventDefault();
    // Envia os valores crus; a action faz o parse com o mesmo schema.
    const raw = form.getValues();
    startTransition(async () => {
      const result = await action(raw);
      if (result?.error) toast.error(result.error);
    });
  });

  return { form, onSubmit, pending };
}
