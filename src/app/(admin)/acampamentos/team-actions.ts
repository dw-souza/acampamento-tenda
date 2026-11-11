"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { campParticipants, camps, campTents, families, tents, workTeams } from "@/db/schema";
import { type ActionResult, dbErrorMessage } from "@/lib/action-result";
import { addFamiliesToCamp } from "@/lib/camp-participation";
import { scheduledCamp } from "@/lib/camp-guards";
import { requireUser } from "@/lib/dal";
import { canServe } from "@/lib/domain/eligibility";

function revalidateCamp(campId: string) {
  revalidatePath(`/acampamentos/${campId}`, "layout");
}

/** Confere se a equipe pode receber servos e se o tenda já passou pela etapa do acampamento. */
async function assertCanServe(campId: string, teamId: string, tentId: string | null) {
  const [camp, team, tent] = await Promise.all([
    db.query.camps.findFirst({ where: eq(camps.id, campId), with: { stage: true } }),
    db.query.workTeams.findFirst({ where: eq(workTeams.id, teamId) }),
    tentId ? db.query.tents.findFirst({ where: eq(tents.id, tentId), with: { currentStage: true } }) : null,
  ]);
  if (!camp || !team) return "Acampamento ou equipe não encontrados.";
  if (camp.status !== "scheduled") return "O acampamento já foi concluído. Desfaça a conclusão para alterar.";
  if (!tent || tent.status !== "active") return "Só famílias de tendas ativos podem servir.";
  if (!canServe(tent.currentStage?.position, camp.stage.position)) {
    return `O tenda ainda não passou pelo ${camp.stage.name}; só serve quem já passou por esta etapa.`;
  }
  return null;
}

/** O tenda inteiro serve na equipe: cada família entra como servo, com todos os membros. */
export async function addTeamTent(campId: string, teamId: string, tentId: string): Promise<ActionResult> {
  await requireUser();
  const team = await db.query.workTeams.findFirst({ where: eq(workTeams.id, teamId) });
  if (team?.kind !== "tent") return { error: "Nesta equipe servem casais avulsos, não tendas inteiros." };
  const problem = await assertCanServe(campId, teamId, tentId);
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
    return { error: dbErrorMessage(error, { unique: "Este tenda já participa deste acampamento." }) };
  }
  revalidateCamp(campId);
  if (skipped > 0) {
    return {
      warning: `${skipped} família(s) do tenda já tinham outra função neste acampamento e ficaram onde estavam.`,
    };
  }
  return undefined;
}

export async function removeTeamTent(campId: string, tentId: string): Promise<ActionResult> {
  await requireUser();
  const guard = await scheduledCamp(campId);
  if (!guard.ok) return { error: guard.error };
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
  const team = await db.query.workTeams.findFirst({ where: eq(workTeams.id, teamId) });
  if (team?.kind !== "special") return { error: "Nesta equipe serve o tenda inteiro, não casais avulsos." };
  const family = await db.query.families.findFirst({ where: eq(families.id, familyId) });
  const problem = await assertCanServe(campId, teamId, family?.tentId ?? null);
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
