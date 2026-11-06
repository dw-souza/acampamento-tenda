import { z } from "zod";
import { optionalEmail, optionalText, optionalUpper, requiredUpper } from "./common";

export const parishSchema = z.object({
  name: requiredUpper("Informe o nome"),
  city: requiredUpper("Informe a cidade"),
  state: z.string().trim().length(2, "Use a sigla (ex.: SP)").toUpperCase(),
  address: optionalUpper,
  zipCode: optionalText,
  phone: optionalText,
  email: optionalEmail,
  responsibleName: optionalUpper,
  responsiblePhone: optionalText,
  active: z.boolean(),
});

export type ParishInput = z.input<typeof parishSchema>;
