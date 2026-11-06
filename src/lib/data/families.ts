import "server-only";
import { and, asc, eq, inArray, isNull, type SQL, sql } from "drizzle-orm";
import { db } from "@/db";
import { campParticipants, families, people } from "@/db/schema";
import { requireUser } from "@/lib/dal";

/** tentId "nenhuma" = famílias sem tenda. */
export type FamilyFilters = { q?: string; parishId?: string; tentId?: string };

export async function listFamilies({ q, parishId, tentId }: FamilyFilters) {
  await requireUser();
  const conditions: SQL[] = [];
  if (parishId) conditions.push(eq(families.parishId, parishId));
  if (tentId === "nenhuma") conditions.push(isNull(families.tentId));
  else if (tentId) conditions.push(eq(families.tentId, tentId));
  if (q?.trim()) {
    const matching = db
      .select({ id: people.familyId })
      .from(people)
      // unaccent: "joao" encontra "JOÃO" (extensão criada na migration 0003).
      .where(sql`unaccent(${people.fullName}) ilike unaccent(${`%${q.trim()}%`})`);
    conditions.push(inArray(families.id, matching));
  }

  return db.query.families.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: {
      parish: true,
      tent: true,
      people: { orderBy: asc(people.birthDate) },
    },
    orderBy: asc(families.createdAt),
  });
}

export async function getFamily(id: string) {
  await requireUser();
  return db.query.families.findFirst({
    where: eq(families.id, id),
    with: { people: { orderBy: asc(people.birthDate) }, tent: true, parish: true },
  });
}

/** Acampamentos de que a família participou, do mais recente para o mais antigo. */
export async function getFamilyHistory(familyId: string) {
  await requireUser();
  const rows = await db.query.campParticipants.findMany({
    where: eq(campParticipants.familyId, familyId),
    with: { camp: { with: { stage: true } }, team: true, attendees: true },
  });
  return rows.sort((a, b) => b.camp.startDate.localeCompare(a.camp.startDate));
}
