"use server";

import { and, desc, eq, gte, inArray, max, ne, notExists, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  campParishes,
  campParticipants,
  camps,
  campTents,
  families,
  stages,
  tents,
  tentStageHistory,
} from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { scheduledCamp } from "@/lib/camp-guards";
import { addFamiliesToCamp } from "@/lib/camp-participation";
import { requireUser } from "@/lib/dal";
import { type CampInput, campSchema } from "@/lib/validation/camp";

function revalidateCamp(campId: string) {
  revalidatePath("/acampamentos");
  revalidatePath(`/acampamentos/${campId}`, "layout");
}

// ---------------------------------------------------------------------------
// Cadastro
// ---------------------------------------------------------------------------

export async function saveCamp(id: string | null, input: CampInput): Promise<ActionResult> {
  await requireUser();
  const parsed = parseOrError(campSchema, input);
  if (!parsed.ok) return { error: parsed.error };
  const { adultPrice, childPrice, serverAdultPrice, serverChildPrice, ...rest } = parsed.data;
  const values = {
    ...rest,
    adultPriceCents: adultPrice,
    childPriceCents: childPrice,
    serverAdultPriceCents: serverAdultPrice,
    serverChildPriceCents: serverChildPrice,
  };

  let campId = id;
  try {
    if (id) {
      const current = await db.query.camps.findFirst({
        where: eq(camps.id, id),
        with: { participants: { limit: 1 }, parishes: { limit: 1 }, tents: { limit: 1 } },
      });
      const hasLinks =
        !!current && current.participants.length + current.parishes.length + current.tents.length > 0;
      if (current && current.stageId !== values.stageId && (current.status !== "scheduled" || hasLinks)) {
        return {
          error:
            "Só é possível trocar a etapa de um acampamento agendado e ainda sem paróquias, tendas ou inscrições.",
        };
      }
      await db.update(camps).set(values).where(eq(camps.id, id));
    } else {
      const [created] = await db.insert(camps).values(values).returning({ id: camps.id });
      campId = created.id;
    }
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }
  revalidateCamp(campId!);
  redirect(`/acampamentos/${campId}`);
}

export async function deleteCamp(campId: string): Promise<ActionResult> {
  await requireUser();
  try {
    await db.transaction(async (tx) => {
      const forming = await tx
        .select({ id: campParishes.formingTentId })
        .from(campParishes)
        .where(eq(campParishes.campId, campId));
      await tx.delete(camps).where(eq(camps.id, campId));
      await deleteEmptyFormingTents(
        tx,
        forming.flatMap((row) => (row.id ? [row.id] : [])),
      );
    });
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }
  revalidatePath("/acampamentos");
  redirect("/acampamentos");
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Remove tendas em formação que ficaram sem nenhuma família. */
async function deleteEmptyFormingTents(tx: Tx, tentIds: string[]) {
  if (tentIds.length === 0) return;
  await tx
    .delete(tents)
    .where(
      and(
        inArray(tents.id, tentIds),
        eq(tents.status, "forming"),
        notExists(tx.select().from(families).where(eq(families.tentId, tents.id))),
      ),
    );
}

// ---------------------------------------------------------------------------
// Paróquias (etapa em que nascem os tendas)
// ---------------------------------------------------------------------------

/** Vincula a paróquia e cria o tenda que ela vai formar, com o próximo número. */
export async function addCampParish(campId: string, parishId: string): Promise<ActionResult> {
  await requireUser();
  const guard = await scheduledCamp(campId);
  if (!guard.ok) return { error: guard.error };
  const { camp } = guard;
  if (!camp.stage.formsTents) return { error: "Este acampamento não forma tendas." };

  try {
    await db.transaction(async (tx) => {
      const [{ last }] = await tx
        .select({ last: max(tents.number) })
        .from(tents)
        .where(eq(tents.parishId, parishId));
      const [tent] = await tx
        .insert(tents)
        .values({ parishId, number: (last ?? 0) + 1, status: "forming", currentStageId: camp.stageId })
        .returning({ id: tents.id });
      await tx.insert(campParishes).values({ campId, parishId, formingTentId: tent.id });
    });
  } catch (error) {
    return { error: dbErrorMessage(error, { unique: "Esta paróquia já está no acampamento." }) };
  }
  revalidateCamp(campId);
}

export async function removeCampParish(campId: string, parishId: string): Promise<ActionResult> {
  await requireUser();
  const guard = await scheduledCamp(campId);
  if (!guard.ok) return { error: guard.error };
  const registered = await db
    .select({ id: campParticipants.id })
    .from(campParticipants)
    .innerJoin(families, eq(families.id, campParticipants.familyId))
    .where(and(eq(campParticipants.campId, campId), eq(families.parishId, parishId)))
    .limit(1);
  if (registered.length > 0) {
    return { error: "Há famílias inscritas por esta paróquia. Remova as inscrições antes." };
  }

  await db.transaction(async (tx) => {
    const [link] = await tx
      .delete(campParishes)
      .where(and(eq(campParishes.campId, campId), eq(campParishes.parishId, parishId)))
      .returning({ formingTentId: campParishes.formingTentId });
    await deleteEmptyFormingTents(tx, link?.formingTentId ? [link.formingTentId] : []);
  });
  revalidateCamp(campId);
}

// ---------------------------------------------------------------------------
// Tendas campistas (demais etapas)
// ---------------------------------------------------------------------------

export async function addCampTent(campId: string, tentId: string): Promise<ActionResult> {
  await requireUser();
  const guard = await scheduledCamp(campId);
  if (!guard.ok) return { error: guard.error };
  if (guard.camp.stage.formsTents)
    return { error: "Neste acampamento as famílias se inscrevem por paróquia." };

  try {
    await db.transaction(async (tx) => {
      await tx.insert(campTents).values({ campId, tentId, role: "camper" });
      const members = await tx.select({ id: families.id }).from(families).where(eq(families.tentId, tentId));
      await addFamiliesToCamp(
        tx,
        campId,
        members.map((family) => family.id),
        { role: "camper" },
      );
    });
  } catch (error) {
    return { error: dbErrorMessage(error, { unique: "Este tenda já está no acampamento." }) };
  }
  revalidateCamp(campId);
}

/** Desvincula o tenda e as participações de campista das suas famílias. */
export async function removeCampTent(campId: string, tentId: string): Promise<ActionResult> {
  await requireUser();
  const guard = await scheduledCamp(campId);
  if (!guard.ok) return { error: guard.error };
  await db.transaction(async (tx) => {
    await tx.delete(campTents).where(and(eq(campTents.campId, campId), eq(campTents.tentId, tentId)));
    const members = tx.select({ id: families.id }).from(families).where(eq(families.tentId, tentId));
    await tx
      .delete(campParticipants)
      .where(
        and(
          eq(campParticipants.campId, campId),
          eq(campParticipants.role, "camper"),
          inArray(campParticipants.familyId, members),
        ),
      );
  });
  revalidateCamp(campId);
  return undefined;
}

// ---------------------------------------------------------------------------
// Situação do acampamento
// ---------------------------------------------------------------------------

/**
 * Conclui o acampamento: registra a etapa no caminho dos tendas campistas e avança a etapa atual
 * deles. No acampamento aberto (Kerigma), forma os tendas: o tenda em formação vira ativo e
 * quem ficou na lista de espera ou desistiu sai dele.
 */
export async function concludeCamp(campId: string): Promise<ActionResult> {
  await requireUser();
  const camp = await db.query.camps.findFirst({
    where: eq(camps.id, campId),
    with: { stage: true, parishes: true, participants: true, tents: true },
  });
  if (!camp || camp.status !== "scheduled") return { error: "O acampamento já foi concluído." };

  const formingIds = camp.parishes.flatMap((link) => (link.formingTentId ? [link.formingTentId] : []));
  const camperIds = camp.tents.filter((link) => link.role === "camper").map((link) => link.tentId);
  const tentIds = camp.stage.formsTents ? formingIds : camperIds;

  await db.transaction(async (tx) => {
    if (camp.stage.formsTents && formingIds.length > 0) {
      const leaving = camp.participants.filter((p) => p.status !== "confirmed").map((p) => p.familyId);
      if (leaving.length > 0) {
        await tx
          .update(families)
          .set({ tentId: null })
          .where(and(inArray(families.id, leaving), inArray(families.tentId, formingIds)));
      }
      await tx
        .update(tents)
        .set({ status: "active", formedAt: camp.endDate })
        .where(and(inArray(tents.id, formingIds), eq(tents.status, "forming")));
    }
    if (tentIds.length > 0) {
      await tx
        .insert(tentStageHistory)
        .values(tentIds.map((tentId) => ({ tentId, stageId: camp.stageId, campId, date: camp.startDate })))
        .onConflictDoNothing();
      await tx.update(tents).set({ currentStageId: camp.stageId }).where(inArray(tents.id, tentIds));
    }
    await tx.update(camps).set({ status: "finished" }).where(eq(camps.id, campId));
  });
  revalidateCamp(campId);
  revalidatePath("/tendas");
  return undefined;
}

/**
 * Desfaz a conclusão (ex.: concluído por engano). Só é possível se nenhum dos tendas avançou
 * depois deste acampamento, em outro acampamento ou em um marco registrado.
 */
export async function reopenCamp(campId: string): Promise<ActionResult> {
  await requireUser();
  const camp = await db.query.camps.findFirst({
    where: eq(camps.id, campId),
    with: { stage: true, parishes: true, participants: { with: { family: true } } },
  });
  if (!camp || camp.status !== "finished") return { error: "O acampamento não está concluído." };

  const affected = await db
    .select({ tentId: tentStageHistory.tentId })
    .from(tentStageHistory)
    .where(eq(tentStageHistory.campId, campId));
  const tentIds = affected.map((row) => row.tentId);

  if (tentIds.length > 0) {
    const later = await db
      .select({ id: tentStageHistory.id })
      .from(tentStageHistory)
      .innerJoin(stages, eq(stages.id, tentStageHistory.stageId))
      .where(
        and(
          inArray(tentStageHistory.tentId, tentIds),
          ne(tentStageHistory.stageId, camp.stageId),
          or(gte(tentStageHistory.date, camp.startDate), gte(stages.position, camp.stage.position)),
        ),
      )
      .limit(1);
    if (later.length > 0) {
      return {
        error: "Algum tenda deste acampamento já avançou para outra etapa depois dele. Não dá para desfazer.",
      };
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(tentStageHistory).where(eq(tentStageHistory.campId, campId));

    if (camp.stage.formsTents) {
      // Os tendas voltam a "em formação" e quem tinha saído (espera/desistência) volta para eles.
      for (const link of camp.parishes) {
        if (!link.formingTentId) continue;
        await tx
          .update(tents)
          .set({ status: "forming", formedAt: null })
          .where(eq(tents.id, link.formingTentId));
        const back = camp.participants
          .filter((p) => p.status !== "confirmed" && p.family.parishId === link.parishId && !p.family.tentId)
          .map((p) => p.familyId);
        if (back.length > 0) {
          await tx.update(families).set({ tentId: link.formingTentId }).where(inArray(families.id, back));
        }
      }
    } else {
      // A etapa atual volta a ser a mais avançada que sobrou no caminho.
      for (const tentId of tentIds) {
        const [last] = await tx
          .select({ stageId: tentStageHistory.stageId })
          .from(tentStageHistory)
          .innerJoin(stages, eq(stages.id, tentStageHistory.stageId))
          .where(eq(tentStageHistory.tentId, tentId))
          .orderBy(desc(stages.position))
          .limit(1);
        await tx
          .update(tents)
          .set({ currentStageId: last?.stageId ?? null })
          .where(eq(tents.id, tentId));
      }
    }
    await tx.update(camps).set({ status: "scheduled" }).where(eq(camps.id, campId));
  });
  revalidateCamp(campId);
  revalidatePath("/tendas");
  return undefined;
}
