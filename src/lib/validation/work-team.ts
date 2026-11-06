import { z } from "zod";
import { optionalText, requiredText } from "./common";

export const teamKinds = { tent: "Tenda inteira", special: "Casais avulsos" } as const;

export const workTeamSchema = z.object({
  name: requiredText("Informe o nome"),
  kind: z.enum(["tent", "special"], "Selecione o tipo"),
  color: optionalText,
  description: optionalText,
});

export type WorkTeamInput = z.input<typeof workTeamSchema>;
