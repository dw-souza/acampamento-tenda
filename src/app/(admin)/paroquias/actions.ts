"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { parishes } from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { requireUser } from "@/lib/dal";
import { type ParishInput, parishSchema } from "@/lib/validation/parish";

export async function saveParish(id: string | null, input: ParishInput): Promise<ActionResult> {
  await requireUser();
  const parsed = parseOrError(parishSchema, input);
  if (!parsed.ok) return { error: parsed.error };

  try {
    if (id) await db.update(parishes).set(parsed.data).where(eq(parishes.id, id));
    else await db.insert(parishes).values(parsed.data);
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }
  revalidatePath("/paroquias");
  redirect("/paroquias");
}

export async function deleteParish(id: string): Promise<ActionResult> {
  await requireUser();
  try {
    await db.delete(parishes).where(eq(parishes.id, id));
  } catch (error) {
    return {
      error: dbErrorMessage(error, {
        inUse: "A paróquia tem tendas, famílias ou acampamentos. Desative-a em vez de remover.",
      }),
    };
  }
  revalidatePath("/paroquias");
}
