import { DatabaseError } from "pg";
import type { z } from "zod";

/** error: nada foi feito. warning: foi feito, mas com ressalva para a secretaria. */
export type ActionResult =
  { error: string; warning?: undefined } | { warning: string; error?: undefined } | undefined;

/** Converte erros conhecidos do Postgres em mensagens para a secretaria. */
export function dbErrorMessage(error: unknown, messages: { unique?: string; inUse?: string } = {}) {
  const cause = error instanceof Error && error.cause instanceof DatabaseError ? error.cause : error;
  if (cause instanceof DatabaseError) {
    if (cause.code === "23505") return messages.unique ?? "Já existe um registro com esses dados.";
    if (cause.code === "23503") return messages.inUse ?? "Este registro está em uso e não pode ser removido.";
  }
  console.error(error);
  return "Erro inesperado ao salvar. Tente novamente.";
}

export function parseOrError<T extends z.ZodType>(schema: T, input: unknown) {
  const result = schema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "Dados inválidos" } as const;
  }
  return { ok: true, data: result.data as z.output<T> } as const;
}
