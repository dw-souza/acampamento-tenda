import { z } from "zod";
import { parseMoney } from "@/lib/format/money";
import { optionalInt, optionalText, requiredDate, uuid } from "./common";

const money = z.string().transform((value, ctx) => {
  const cents = parseMoney(value);
  if (cents === null) {
    ctx.addIssue({ code: "custom", message: "Valor inválido (ex.: 125,00)" });
    return z.NEVER;
  }
  return cents;
});

export const campStatusLabels = {
  scheduled: "Agendado",
  finished: "Realizado",
} as const;

export const campSchema = z
  .object({
    stageId: uuid,
    startDate: requiredDate,
    endDate: requiredDate,
    adultPrice: money,
    childPrice: money,
    serverAdultPrice: money,
    serverChildPrice: money,
    expectedFamilies: optionalInt,
    notes: optionalText,
  })
  .refine((camp) => camp.endDate >= camp.startDate, {
    message: "O fim deve ser depois do início",
    path: ["endDate"],
  });

export type CampInput = z.input<typeof campSchema>;

// Só no Kerigma (acampamento aberto): até minutos antes de começar alguém pode desistir
// e uma família da lista de espera ser convidada.
export const participantStatusLabels = {
  confirmed: "Inscrita",
  waitlist: "Lista de espera",
  cancelled: "Desistiu",
} as const;

export const participantStatusSchema = z.enum(["confirmed", "waitlist", "cancelled"]);
