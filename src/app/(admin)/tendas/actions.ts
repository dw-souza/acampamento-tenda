"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { families, stages, tents, tentStageHistory } from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { requireUser } from "@/lib/dal";
import { type TentInput, tentSchema } from "@/lib/validation/tent";

export async function saveTent(id: string | null, input: TentInput): Promise<ActionResult> {
  await requireUser();
  const parsed = parseOrError(tentSchema, input);
  if (!parsed.ok) return { error: parsed.error };
  const data = parsed.data;

  if (data.guardianFamilyId) {
    const guardian = id
      ? await db.query.families.findFirst({
          where: and(eq(families.id, data.guardianFamilyId), eq(families.tentId, id)),
        })
      : undefined;
    if (!guardian) return { error: "Os guardiões precisam ser uma família desta tenda." };
  }

  let tentId = id;
  try {
    if (id) {
      await db.update(tents).set(data).where(eq(tents.id, id));
    } else {
      const [created] = await db.insert(tents).values(data).returning({ id: tents.id });
      tentId = created.id;
    }
  } catch (error) {
    return {
      error: dbErrorMessage(error, { unique: "Já existe uma tenda com esse número nesta paróquia." }),
    };
  }
  revalidatePath("/tendas");
  redirect(`/tendas/${tentId}`);
}

export async function deleteTent(id: string): Promise<ActionResult> {
  await requireUser();
  try {
    await db.delete(tents).where(eq(tents.id, id));
  } catch (error) {
    return {
      error: dbErrorMessage(error, {
        inUse: "A tenda já participou de acampamentos. Marque-a como inativa.",
      }),
    };
  }
  revalidatePath("/tendas");
  redirect("/tendas");
}

/** Registra uma etapa no caminho da tenda (marcos sem acampamento, como Ventania e Chai). */
export async function recordTentStage(tentId: string, stageId: string, date: string): Promise<ActionResult> {
  await requireUser();
  if (!stageId) return { error: "Escolha a etapa." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Informe a data." };

  const [tent, stage] = await Promise.all([
    db.query.tents.findFirst({ where: eq(tents.id, tentId), with: { currentStage: true } }),
    db.query.stages.findFirst({ where: eq(stages.id, stageId) }),
  ]);
  if (!tent || !stage) return { error: "Tenda ou etapa não encontrada." };

  await db.transaction(async (tx) => {
    await tx
      .insert(tentStageHistory)
      .values({ tentId, stageId, date })
      .onConflictDoUpdate({ target: [tentStageHistory.tentId, tentStageHistory.stageId], set: { date } });
    // A etapa atual só avança; registrar uma etapa antiga não faz a tenda voltar.
    if (!tent.currentStage || stage.position >= tent.currentStage.position) {
      await tx.update(tents).set({ currentStageId: stageId }).where(eq(tents.id, tentId));
    }
  });
  revalidatePath(`/tendas/${tentId}`);
  return undefined;
}

export async function removeTentStage(tentId: string, historyId: string): Promise<ActionResult> {
  await requireUser();
  await db
    .delete(tentStageHistory)
    .where(and(eq(tentStageHistory.id, historyId), eq(tentStageHistory.tentId, tentId)));
  revalidatePath(`/tendas/${tentId}`);
  return undefined;
}
