import { z } from "zod";
import { requiredText } from "./common";

export const stageSchema = z.object({
  name: requiredText("Informe o nome"),
  position: z.coerce.number<string | number>().int().min(1, "Posição deve ser 1 ou maior"),
  hasCamp: z.boolean(),
});

export type StageInput = z.input<typeof stageSchema>;
