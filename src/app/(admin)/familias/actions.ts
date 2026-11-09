"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { families, tents } from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { requireUser } from "@/lib/dal";
import { writeFamily } from "@/lib/family-write";
import { type FamilyInput, familySchema } from "@/lib/validation/family";

export async function saveFamily(id: string | null, input: FamilyInput): Promise<ActionResult> {
  await requireUser();
  const parsed = parseOrError(familySchema, input);
  if (!parsed.ok) return { error: parsed.error };
  const family = parsed.data;

  if (family.tentId) {
    const tent = await db.query.tents.findFirst({ where: eq(tents.id, family.tentId) });
    if (tent?.parishId !== family.parishId) {
      return { error: "O tenda escolhido não pertence a esta paróquia." };
    }
  }

  let familyId = id;
  try {
    familyId = await db.transaction((tx) => writeFamily(tx, id, family));
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }

  revalidatePath("/familias");
  redirect(`/familias/${familyId}`);
}

export async function deleteFamily(id: string): Promise<ActionResult> {
  await requireUser();
  try {
    await db.delete(families).where(eq(families.id, id));
  } catch (error) {
    return { error: dbErrorMessage(error) };
  }
  revalidatePath("/familias");
  redirect("/familias");
}
