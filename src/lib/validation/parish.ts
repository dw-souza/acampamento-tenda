import { z } from "zod";
import { optionalEmail, optionalText, requiredText } from "./common";

export const parishSchema = z.object({
  name: requiredText("Informe o nome"),
  city: requiredText("Informe a cidade"),
  state: z.string().trim().length(2, "Use a sigla (ex.: SP)").toUpperCase(),
  address: optionalText,
  zipCode: optionalText,
  phone: optionalText,
  email: optionalEmail,
  responsibleName: optionalText,
  responsiblePhone: optionalText,
  active: z.boolean(),
});

export type ParishInput = z.input<typeof parishSchema>;
