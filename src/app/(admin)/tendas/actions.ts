"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { families, tents } from "@/db/schema";
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
    return { error: dbErrorMessage(error, { unique: "Já existe uma tenda com esse número nesta paróquia." }) };
  }
  revalidatePath("/tendas");
  redirect(`/tendas/${tentId}`);
}

export async function deleteTent(id: string): Promise<ActionResult> {
  await requireUser();
  try {
    await db.delete(tents).where(eq(tents.id, id));
  } catch (error) {
    return { error: dbErrorMessage(error, { inUse: "A tenda já participou de acampamentos. Marque-a como inativa." }) };
  }
  revalidatePath("/tendas");
  redirect("/tendas");
}
