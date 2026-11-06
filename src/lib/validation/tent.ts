import { z } from "zod";
import { optionalDate, optionalText, optionalUpper, optionalUuid, uuid } from "./common";

export const tentSchema = z.object({
  parishId: uuid,
  number: z.coerce.number<string | number>().int().min(1, "Número deve ser 1 ou maior"),
  name: optionalUpper,
  status: z.enum(["forming", "active", "inactive"]),
  currentStageId: optionalUuid,
  guardianFamilyId: optionalUuid,
  meetingSchedule: optionalText,
  meetingLocation: optionalUpper,
  formedAt: optionalDate,
});

export type TentInput = z.input<typeof tentSchema>;
