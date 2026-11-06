import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { families, parishes, stages, tents } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { tentLabel } from "@/lib/format/labels";

export async function listTents(filters: { parishId?: string } = {}) {
  await requireUser();
  const familyCount = db
    .select({ tentId: families.tentId, n: count().as("n") })
    .from(families)
    .groupBy(families.tentId)
    .as("family_count");

  return db
    .select({
      id: tents.id,
      number: tents.number,
      name: tents.name,
      status: tents.status,
      parishName: parishes.name,
      stageName: stages.name,
      families: familyCount.n,
    })
    .from(tents)
    .innerJoin(parishes, eq(parishes.id, tents.parishId))
    .leftJoin(stages, eq(stages.id, tents.currentStageId))
    .leftJoin(familyCount, eq(familyCount.tentId, tents.id))
    .where(filters.parishId ? eq(tents.parishId, filters.parishId) : undefined)
    .orderBy(asc(parishes.name), asc(tents.number));
}

export async function getTent(id: string) {
  await requireUser();
  return db.query.tents.findFirst({
    where: eq(tents.id, id),
    with: {
      parish: true,
      currentStage: true,
      families: { with: { people: true } },
      stageHistory: { with: { stage: true, camp: true } },
    },
  });
}

/** Todas as tendas com a paróquia, para selects filtrados por paróquia no cliente. */
export async function tentOptions() {
  await requireUser();
  const rows = await db.query.tents.findMany({ orderBy: asc(tents.number) });
  return rows.map((tent) => ({ value: tent.id, label: tentLabel(tent), parishId: tent.parishId }));
}
