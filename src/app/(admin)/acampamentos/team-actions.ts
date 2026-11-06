"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { campParticipants, camps, campTents, families, workTeams } from "@/db/schema";
import { type ActionResult, dbErrorMessage } from "@/lib/action-result";
import { addFamiliesToCamp } from "@/lib/camp-participation";
import { requireUser } from "@/lib/dal";

function revalidateCamp(campId: string) {
  revalidatePath(`/acampamentos/${campId}`, "layout");
}

async function assertEditable(campId: string, teamId: string) {
  const [camp, team] = await Promise.all([
    db.query.camps.findFirst({ where: eq(camps.id, campId) }),
    db.query.workTeams.findFirst({ where: eq(workTeams.id, teamId) }),
  ]);
  if (!camp || !team) return "Acampamento ou equipe não encontrados.";
  if (camp.status === "finished") return "O acampamento já foi realizado.";
  return null;
}

/** A tenda inteira serve na equipe: cada família entra como servo, com todos os membros. */
export async function addTeamTent(campId: string, teamId: string, tentId: string): Promise<ActionResult> {
  await requireUser();
  const problem = await assertEditable(campId, teamId);
  if (problem) return { error: problem };

  let skipped = 0;
  try {
    await db.transaction(async (tx) => {
      await tx.insert(campTents).values({ campId, tentId, role: "server", teamId });
      const members = await tx.select({ id: families.id }).from(families).where(eq(families.tentId, tentId));
      const added = await addFamiliesToCamp(
        tx,
        campId,
        members.map((family) => family.id),
        {
          role: "server",
          teamId,
        },
      );
      skipped = members.length - added;
    });
  } catch (error) {
    return { error: dbErrorMessage(error, { unique: "Esta tenda já participa deste acampamento." }) };
  }
  revalidateCamp(campId);
  if (skipped > 0) {
    return {
      warning: `${skipped} família(s) da tenda já tinham outra função neste acampamento e ficaram onde estavam.`,
    };
  }
  return undefined;
}

export async function removeTeamTent(campId: string, tentId: string): Promise<ActionResult> {
  await requireUser();
  await db.transaction(async (tx) => {
    const [link] = await tx
      .delete(campTents)
      .where(and(eq(campTents.campId, campId), eq(campTents.tentId, tentId), eq(campTents.role, "server")))
      .returning({ teamId: campTents.teamId });
    if (!link?.teamId) return;
    const members = tx.select({ id: families.id }).from(families).where(eq(families.tentId, tentId));
    await tx
      .delete(campParticipants)
      .where(
        and(
          eq(campParticipants.campId, campId),
          eq(campParticipants.role, "server"),
          eq(campParticipants.teamId, link.teamId),
          inArray(campParticipants.familyId, members),
        ),
      );
  });
  revalidateCamp(campId);
  return undefined;
}

/** Um casal avulso serve na equipe (ex.: música, ensino). */
export async function addTeamFamily(campId: string, teamId: string, familyId: string): Promise<ActionResult> {
  await requireUser();
  const problem = await assertEditable(campId, teamId);
  if (problem) return { error: problem };

  try {
    const added = await db.transaction((tx) =>
      addFamiliesToCamp(tx, campId, [familyId], { role: "server", teamId }),
    );
    if (added === 0) return { error: "Esta família já tem uma função neste acampamento." };
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }
  revalidateCamp(campId);
  return undefined;
}

export async function setCoordinator(participantId: string, isCoordinator: boolean): Promise<ActionResult> {
  await requireUser();
  const [row] = await db
    .update(campParticipants)
    .set({ isCoordinator })
    .where(and(eq(campParticipants.id, participantId), eq(campParticipants.role, "server")))
    .returning({ campId: campParticipants.campId });
  if (row) revalidateCamp(row.campId);
  return undefined;
}
