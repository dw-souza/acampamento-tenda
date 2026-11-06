"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stages } from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { requireUser } from "@/lib/dal";
import { type StageInput, stageSchema } from "@/lib/validation/stage";

export async function saveStage(id: string | null, input: StageInput): Promise<ActionResult> {
  await requireUser();
  const parsed = parseOrError(stageSchema, input);
  if (!parsed.ok) return { error: parsed.error };

  try {
    if (id) await db.update(stages).set(parsed.data).where(eq(stages.id, id));
    else await db.insert(stages).values(parsed.data);
  } catch (error) {
    return { error: dbErrorMessage(error, { unique: "Já existe uma etapa com esse nome ou posição." }) };
  }
  revalidatePath("/etapas");
  redirect("/etapas");
}

export async function deleteStage(id: string): Promise<ActionResult> {
  await requireUser();
  try {
    await db.delete(stages).where(eq(stages.id, id));
  } catch (error) {
    return { error: dbErrorMessage(error, { inUse: "A etapa está em uso por tendas ou acampamentos." }) };
  }
  revalidatePath("/etapas");
}
