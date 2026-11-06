import { z } from "zod";
import { parseMoney } from "@/lib/format/money";
import { optionalInt, optionalText, requiredDate, requiredUpper, uuid } from "./common";

const money = z.string().transform((value, ctx) => {
  const cents = parseMoney(value);
  if (cents === null) {
    ctx.addIssue({ code: "custom", message: "Valor inválido (ex.: 125,00)" });
    return z.NEVER;
  }
  return cents;
});

export const campStatusLabels = {
  draft: "Em preparação",
  open: "Inscrições abertas",
  closed: "Inscrições encerradas",
  finished: "Realizado",
} as const;

export const campSchema = z
  .object({
    stageId: uuid,
    name: requiredUpper("Informe o nome"),
    startDate: requiredDate,
    endDate: requiredDate,
    adultPrice: money,
    childPrice: money,
    expectedFamilies: optionalInt,
    notes: optionalText,
  })
  .refine((camp) => camp.endDate >= camp.startDate, {
    message: "O fim deve ser depois do início",
    path: ["endDate"],
  });

export type CampInput = z.input<typeof campSchema>;

export const participantStatusLabels = {
  pending: "Pendente",
  confirmed: "Confirmada",
  waitlist: "Lista de espera",
  cancelled: "Cancelada",
} as const;

export const participantStatusSchema = z.enum(["pending", "confirmed", "waitlist", "cancelled"]);
