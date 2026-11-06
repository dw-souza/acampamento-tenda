import { z } from "zod";

/** Texto opcional: "" vira null. */
export const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

export const requiredText = (message = "Obrigatório") => z.string().trim().min(1, message);

// Nomes e endereços são gravados em maiúsculas (padrão da secretaria).
export const optionalUpper = optionalText.transform((value) => value?.toUpperCase() ?? null);

export const requiredUpper = (message = "Obrigatório") =>
  requiredText(message).transform((value) => value.toUpperCase());

/** Data opcional vinda de <input type="date">: "" vira null. */
export const optionalDate = z
  .string()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Data inválida")
  .transform((value) => value || null);

export const optionalUuid = z
  .string()
  .transform((value) => value || null)
  .pipe(z.uuid().nullable());

export const uuid = z.uuid("Selecione uma opção");

export const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === "" || z.email().safeParse(value).success, "E-mail inválido")
  .transform((value) => value || null);

export const requiredDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data");

/** Inteiro opcional vindo de <input type="number">: "" vira null. */
export const optionalInt = z
  .union([z.string(), z.number()])
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(z.number().int("Use um número inteiro").min(0).nullable());
