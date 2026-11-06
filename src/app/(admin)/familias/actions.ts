"use server";

import { and, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { families, people, tents } from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { requireUser } from "@/lib/dal";
import { type FamilyInput, familySchema } from "@/lib/validation/family";

export async function saveFamily(id: string | null, input: FamilyInput): Promise<ActionResult> {
  await requireUser();
  const parsed = parseOrError(familySchema, input);
  if (!parsed.ok) return { error: parsed.error };
  const { husband, wife, children, ...family } = parsed.data;

  if (family.tentId) {
    const tent = await db.query.tents.findFirst({ where: eq(tents.id, family.tentId) });
    if (tent?.parishId !== family.parishId) {
      return { error: "A tenda escolhida não pertence a esta paróquia." };
    }
  }

  const members = [
    { ...husband, role: "husband" as const },
    { ...wife, role: "wife" as const },
    ...children.map((child) => ({ ...child, role: "child" as const })),
  ];

  let familyId = id;
  try {
    await db.transaction(async (tx) => {
      if (familyId) {
        await tx.update(families).set(family).where(eq(families.id, familyId));
      } else {
        const [created] = await tx.insert(families).values(family).returning({ id: families.id });
        familyId = created.id;
      }

      // Remove quem saiu do formulário (ex.: filho apagado) e sincroniza o resto.
      const keptIds = members.flatMap((member) => (member.id ? [member.id] : []));
      await tx
        .delete(people)
        .where(
          and(
            eq(people.familyId, familyId),
            keptIds.length ? notInArray(people.id, keptIds) : undefined,
          ),
        );

      for (const { id: personId, ...member } of members) {
        if (personId) {
          await tx
            .update(people)
            .set(member)
            .where(and(eq(people.id, personId), eq(people.familyId, familyId)));
        } else {
          await tx.insert(people).values({ ...member, familyId });
        }
      }
    });
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
