import { z } from "zod";
import { requiredUpper } from "./common";

export const stageSchema = z.object({
  name: requiredUpper("Informe o nome"),
  position: z.coerce.number<string | number>().int().min(1, "Posição deve ser 1 ou maior"),
  hasCamp: z.boolean(),
  formsTents: z.boolean(),
});

export type StageInput = z.input<typeof stageSchema>;
