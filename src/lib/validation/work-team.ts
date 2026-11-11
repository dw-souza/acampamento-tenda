import { z } from "zod";
import { optionalText, requiredUpper } from "./common";

export const teamKinds = { tent: "Tenda inteiro", special: "Casais avulsos" } as const;

export const workTeamSchema = z.object({
  name: requiredUpper("Informe o nome"),
  kind: z.enum(["tent", "special"], "Selecione o tipo"),
  highlight: z.boolean(),
  color: optionalText,
  description: optionalText,
});

export type WorkTeamInput = z.input<typeof workTeamSchema>;
