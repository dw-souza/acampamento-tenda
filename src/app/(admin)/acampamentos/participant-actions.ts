"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { campAttendees, campParticipants, camps, families, people } from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { addFamiliesToCamp } from "@/lib/camp-participation";
import { requireUser } from "@/lib/dal";
import { writeFamily } from "@/lib/family-write";
import { participantStatusSchema } from "@/lib/validation/camp";
import { type FamilyInput, familySchema } from "@/lib/validation/family";

function revalidateCamp(campId: string) {
  revalidatePath(`/acampamentos/${campId}`, "layout");
}

/** Inscrição no acampamento em que nascem os tendas: cria a família já no tenda em formação. */
export async function registerFamily(campId: string, input: FamilyInput): Promise<ActionResult> {
  await requireUser();
  const camp = await db.query.camps.findFirst({
    where: eq(camps.id, campId),
    with: { stage: true, parishes: true },
  });
  if (!camp?.stage.formsTents) return { error: "Este acampamento não recebe inscrições de famílias." };
  if (camp.status !== "scheduled") return { error: "O acampamento já foi concluído." };

  const parsed = parseOrError(familySchema, input);
  if (!parsed.ok) return { error: parsed.error };
  const link = camp.parishes.find((parish) => parish.parishId === parsed.data.parishId);
  if (!link) return { error: "Escolha uma das paróquias do acampamento." };

  try {
    await db.transaction(async (tx) => {
      const familyId = await writeFamily(tx, null, { ...parsed.data, tentId: link.formingTentId });
      await addFamiliesToCamp(tx, campId, [familyId], { role: "camper" });
    });
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }
  revalidateCamp(campId);
  revalidatePath("/familias");
  redirect(`/acampamentos/${campId}/campistas`);
}

export async function setParticipantStatus(participantId: string, status: string): Promise<ActionResult> {
  await requireUser();
  const parsed = parseOrError(participantStatusSchema, status);
  if (!parsed.ok) return { error: parsed.error };

  // Lista de espera e desistência só existem no acampamento aberto, e só antes de concluir.
  const participant = await db.query.campParticipants.findFirst({
    where: eq(campParticipants.id, participantId),
    with: { camp: { with: { stage: true } } },
  });
  if (!participant) return undefined;
  if (!participant.camp.stage.formsTents) return { error: "Só o acampamento aberto tem lista de espera." };
  if (participant.camp.status !== "scheduled") return { error: "O acampamento já foi concluído." };

  await db
    .update(campParticipants)
    .set({ status: parsed.data })
    .where(eq(campParticipants.id, participantId));
  revalidateCamp(participant.campId);
  return undefined;
}

/** Marca ou desmarca um membro da família como presente no acampamento. */
export async function setAttendance(
  participantId: string,
  personId: string,
  attending: boolean,
): Promise<ActionResult> {
  await requireUser();
  const [participant] = await db
    .select({ campId: campParticipants.campId })
    .from(campParticipants)
    .innerJoin(people, eq(people.familyId, campParticipants.familyId))
    .where(and(eq(campParticipants.id, participantId), eq(people.id, personId)));
  if (!participant) return { error: "Pessoa não pertence a esta família." };

  if (attending) {
    await db.insert(campAttendees).values({ participantId, personId }).onConflictDoNothing();
  } else {
    await db
      .delete(campAttendees)
      .where(and(eq(campAttendees.participantId, participantId), eq(campAttendees.personId, personId)));
  }
  revalidateCamp(participant.campId);
  return undefined;
}

/**
 * Remove a família do acampamento. Se ela estava num tenda em formação deste
 * acampamento, sai do tenda também (o cadastro da família continua).
 */
export async function removeParticipant(participantId: string): Promise<ActionResult> {
  await requireUser();
  const participant = await db.query.campParticipants.findFirst({
    where: eq(campParticipants.id, participantId),
    with: { family: true, camp: { with: { parishes: true } } },
  });
  if (!participant) return undefined;
  if (participant.camp.status !== "scheduled") {
    return { error: "O acampamento já foi concluído. Desfaça a conclusão para alterar." };
  }

  const formingTentIds = participant.camp.parishes.map((link) => link.formingTentId);
  try {
    await db.transaction(async (tx) => {
      await tx.delete(campParticipants).where(eq(campParticipants.id, participantId));
      if (participant.family.tentId && formingTentIds.includes(participant.family.tentId)) {
        await tx.update(families).set({ tentId: null }).where(eq(families.id, participant.familyId));
      }
    });
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }
  revalidateCamp(participant.campId);
  return undefined;
}
