import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { campAttendees, campParticipants, people } from "@/db/schema";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/**
 * Inscreve famílias num acampamento com todos os membros ativos marcados como presentes.
 * Famílias que já participam são ignoradas (uma função por família por acampamento).
 * Retorna quantas foram inscritas.
 */
export async function addFamiliesToCamp(
  tx: Tx,
  campId: string,
  familyIds: string[],
  participation: { role: "camper" | "server"; teamId?: string | null; status?: "pending" | "confirmed" },
) {
  if (familyIds.length === 0) return 0;

  const created = await tx
    .insert(campParticipants)
    .values(
      familyIds.map((familyId) => ({
        campId,
        familyId,
        role: participation.role,
        teamId: participation.teamId ?? null,
        status: participation.status ?? "confirmed",
      })),
    )
    .onConflictDoNothing({ target: [campParticipants.campId, campParticipants.familyId] })
    .returning({ id: campParticipants.id, familyId: campParticipants.familyId });

  if (created.length === 0) return 0;

  const members = await tx
    .select({ id: people.id, familyId: people.familyId })
    .from(people)
    .where(and(inArray(people.familyId, created.map((row) => row.familyId)), eq(people.status, "active")));

  const participantByFamily = new Map(created.map((row) => [row.familyId, row.id]));
  if (members.length > 0) {
    await tx.insert(campAttendees).values(
      members.map((member) => ({
        participantId: participantByFamily.get(member.familyId)!,
        personId: member.id,
      })),
    );
  }
  return created.length;
}
