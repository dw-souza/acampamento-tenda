import { z } from "zod";
import {
  optionalDate,
  optionalEmail,
  optionalText,
  optionalUpper,
  optionalUuid,
  requiredUpper,
  uuid,
} from "./common";

const personStatus = z.enum(["active", "deceased", "left"]);

const personFields = {
  id: optionalUuid,
  fullName: requiredUpper("Informe o nome"),
  badgeName: optionalUpper,
  birthDate: optionalDate,
  dietaryRestrictions: optionalText,
  specialNeeds: optionalText,
  status: personStatus,
};

export const spouseSchema = z.object({
  ...personFields,
  phone: optionalText,
  email: optionalEmail,
  profession: optionalUpper,
});

export const childSchema = z.object(personFields);

// A família entra sempre como casal completo; se depois se dissolver,
// o cônjuge continua registrado com status "falecido" ou "saiu".
export const familySchema = z.object({
  parishId: uuid,
  tentId: optionalUuid,
  address: optionalUpper,
  neighborhood: optionalUpper,
  city: optionalUpper,
  state: z
    .string()
    .trim()
    .toUpperCase()
    .transform((value) => value || null),
  zipCode: optionalText,
  weddingDate: optionalDate,
  mainContactRole: z.enum(["husband", "wife"]),
  notes: optionalText,
  husband: spouseSchema,
  wife: spouseSchema,
  children: z.array(childSchema),
});

export type FamilyInput = z.input<typeof familySchema>;
export type FamilyData = z.output<typeof familySchema>;
