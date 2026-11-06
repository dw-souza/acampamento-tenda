import { z } from "zod";
import { optionalDate, optionalText, optionalUuid, uuid } from "./common";

export const tentSchema = z.object({
  parishId: uuid,
  number: z.coerce.number<string | number>().int().min(1, "Número deve ser 1 ou maior"),
  name: optionalText,
  status: z.enum(["forming", "active", "inactive"]),
  currentStageId: optionalUuid,
  guardianFamilyId: optionalUuid,
  meetingSchedule: optionalText,
  meetingLocation: optionalText,
  formedAt: optionalDate,
});

export type TentInput = z.input<typeof tentSchema>;
