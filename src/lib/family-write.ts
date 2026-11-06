import "server-only";
import { and, eq, notInArray } from "drizzle-orm";
import type { Db } from "@/db";
import { families, people } from "@/db/schema";
import type { FamilyData } from "@/lib/validation/family";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Grava a família e sincroniza os membros (cria, atualiza e remove). Retorna o id. */
export async function writeFamily(tx: Tx, id: string | null, data: FamilyData) {
  const { husband, wife, children, ...family } = data;
  const members = [
    { ...husband, role: "husband" as const },
    { ...wife, role: "wife" as const },
    ...children.map((child) => ({ ...child, role: "child" as const })),
  ];

  let familyId = id;
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
    .where(and(eq(people.familyId, familyId), keptIds.length ? notInArray(people.id, keptIds) : undefined));

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
  return familyId;
}
