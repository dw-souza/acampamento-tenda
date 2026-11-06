import "server-only";
import { and, asc, eq, inArray, type SQL, sql } from "drizzle-orm";
import { db } from "@/db";
import { families, people } from "@/db/schema";
import { requireUser } from "@/lib/dal";

export type FamilyFilters = { q?: string; parishId?: string; tentId?: string };

export async function listFamilies({ q, parishId, tentId }: FamilyFilters) {
  await requireUser();
  const conditions: SQL[] = [];
  if (parishId) conditions.push(eq(families.parishId, parishId));
  if (tentId) conditions.push(eq(families.tentId, tentId));
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
