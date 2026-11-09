"use server";

import { and, eq, inArray, max, notExists } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  campParishes,
  campParticipants,
  camps,
  campTents,
  families,
  tents,
  tentStageHistory,
} from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { addFamiliesToCamp } from "@/lib/camp-participation";
import { requireUser } from "@/lib/dal";
import { type CampInput, campSchema } from "@/lib/validation/camp";

function revalidateCamp(campId: string) {
  revalidatePath("/acampamentos");
  revalidatePath(`/acampamentos/${campId}`, "layout");
}

async function loadCamp(campId: string) {
  return db.query.camps.findFirst({ where: eq(camps.id, campId), with: { stage: true } });
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
      const current = await loadCamp(id);
      if (current && current.stageId !== values.stageId && current.status !== "draft") {
        return { error: "Só é possível trocar a etapa enquanto o acampamento está em preparação." };
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
  const camp = await loadCamp(campId);
  if (!camp?.stage.formsTents) return { error: "Este acampamento não forma tendas." };
  if (camp.status === "closed" || camp.status === "finished") {
    return { error: "As inscrições deste acampamento já foram encerradas." };
  }

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
  const camp = await loadCamp(campId);
  if (!camp || camp.stage.formsTents)
    return { error: "Neste acampamento as famílias se inscrevem por paróquia." };
  if (camp.status === "finished") return { error: "O acampamento já foi realizado." };

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

export async function openRegistrations(campId: string): Promise<ActionResult> {
  await requireUser();
  await db
    .update(camps)
    .set({ status: "open" })
    .where(and(eq(camps.id, campId), eq(camps.status, "draft")));
  revalidateCamp(campId);
  return undefined;
}

/**
 * Encerra as inscrições. Na etapa em que nascem os tendas, cada tenda em formação
 * vira ativo com as famílias confirmadas; quem cancelou ou ficou na espera sai do tenda.
 */
export async function closeRegistrations(campId: string): Promise<ActionResult> {
  await requireUser();
  const camp = await db.query.camps.findFirst({
    where: eq(camps.id, campId),
    with: { stage: true, parishes: true, participants: true },
  });
  if (!camp || camp.status !== "open") return { error: "As inscrições não estão abertas." };
  if (camp.participants.some((participant) => participant.status === "pending")) {
    return { error: "Há inscrições pendentes. Confirme, cancele ou coloque na espera antes de encerrar." };
  }

  await db.transaction(async (tx) => {
    if (camp.stage.formsTents) {
      const tentIds = camp.parishes.flatMap((link) => (link.formingTentId ? [link.formingTentId] : []));
      const leaving = camp.participants
        .filter((participant) => participant.status !== "confirmed")
        .map((participant) => participant.familyId);

      if (leaving.length > 0 && tentIds.length > 0) {
        await tx
          .update(families)
          .set({ tentId: null })
          .where(and(inArray(families.id, leaving), inArray(families.tentId, tentIds)));
      }
      if (tentIds.length > 0) {
        await tx
          .update(tents)
          .set({ status: "active", formedAt: camp.endDate })
          .where(and(inArray(tents.id, tentIds), eq(tents.status, "forming")));
        await tx
          .insert(tentStageHistory)
          .values(tentIds.map((tentId) => ({ tentId, stageId: camp.stageId, campId, date: camp.startDate })))
          .onConflictDoNothing();
      }
    }
    await tx.update(camps).set({ status: "closed" }).where(eq(camps.id, campId));
  });
  revalidateCamp(campId);
  revalidatePath("/tendas");
}

/** Marca como realizado e registra a etapa no caminho dos tendas campistas. */
export async function finishCamp(campId: string): Promise<ActionResult> {
  await requireUser();
  const camp = await db.query.camps.findFirst({ where: eq(camps.id, campId), with: { tents: true } });
  if (!camp || camp.status !== "closed") return { error: "Encerre as inscrições antes." };

  const tentIds = camp.tents.filter((link) => link.role === "camper").map((link) => link.tentId);
  await db.transaction(async (tx) => {
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
}
