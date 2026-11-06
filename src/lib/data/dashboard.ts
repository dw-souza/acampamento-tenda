import "server-only";
import { and, asc, count, desc, eq, gte, isNull, lt, max, ne, notExists, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  campParishes,
  campParticipants,
  camps,
  families,
  parishes,
  people,
  stages,
  tents,
  tentStageHistory,
} from "@/db/schema";
import { requireUser } from "@/lib/dal";

export async function communityTotals() {
  await requireUser();
  const [[tentRow], [familyRow], [peopleRow], [parishRow]] = await Promise.all([
    db
      .select({
        active: sql<number>`count(*) filter (where ${tents.status} = 'active')`.mapWith(Number),
        forming: sql<number>`count(*) filter (where ${tents.status} = 'forming')`.mapWith(Number),
      })
      .from(tents),
    db
      .select({ n: count() })
      .from(families)
      .innerJoin(tents, eq(tents.id, families.tentId))
      .where(eq(tents.status, "active")),
    db
      .select({
        adults: sql<number>`count(*) filter (where ${people.role} <> 'child')`.mapWith(Number),
        children: sql<number>`count(*) filter (where ${people.role} = 'child')`.mapWith(Number),
      })
      .from(people)
      .innerJoin(families, eq(families.id, people.familyId))
      .innerJoin(tents, eq(tents.id, families.tentId))
      .where(and(eq(tents.status, "active"), eq(people.status, "active"))),
    db.select({ n: count() }).from(parishes).where(eq(parishes.active, true)),
  ]);
  return {
    activeTents: tentRow.active,
    formingTents: tentRow.forming,
    families: familyRow.n,
    adults: peopleRow.adults,
    children: peopleRow.children,
    parishes: parishRow.n,
  };
}

/** Etapas em ordem com as tendas ativas que estão em cada uma. */
export async function tentsByStage() {
  await requireUser();
  const [stageRows, tentRows] = await Promise.all([
    db.query.stages.findMany({ orderBy: asc(stages.position) }),
    db.query.tents.findMany({
      where: eq(tents.status, "active"),
      with: { parish: true },
      orderBy: asc(tents.number),
    }),
  ]);
  const rows = stageRows.map((stage) => ({
    id: stage.id as string | null,
    name: stage.name,
    hasCamp: stage.hasCamp,
    tents: tentRows.filter((tent) => tent.currentStageId === stage.id),
  }));
  const withoutStage = tentRows.filter((tent) => !tent.currentStageId);
  if (withoutStage.length > 0) {
    rows.push({ id: null, name: "SEM ETAPA", hasCamp: false, tents: withoutStage });
  }
  return rows;
}

function participantCounts() {
  return db
    .select({
      campId: campParticipants.campId,
      campers:
        sql<number>`count(*) filter (where ${campParticipants.role} = 'camper' and ${campParticipants.status} in ('pending', 'confirmed'))`
          .mapWith(Number)
          .as("campers"),
      servers:
        sql<number>`count(*) filter (where ${campParticipants.role} = 'server' and ${campParticipants.status} in ('pending', 'confirmed'))`
          .mapWith(Number)
          .as("servers"),
    })
    .from(campParticipants)
    .groupBy(campParticipants.campId)
    .as("counts");
}

const campColumns = (counts: ReturnType<typeof participantCounts>) => ({
  id: camps.id,
  name: camps.name,
  startDate: camps.startDate,
  endDate: camps.endDate,
  status: camps.status,
  stageId: camps.stageId,
  stageName: stages.name,
  stagePosition: stages.position,
  campers: counts.campers,
  servers: counts.servers,
});

/** Acampamentos que ainda não terminaram. */
export async function upcomingCamps() {
  await requireUser();
  const counts = participantCounts();
  return db
    .select(campColumns(counts))
    .from(camps)
    .innerJoin(stages, eq(stages.id, camps.stageId))
    .leftJoin(counts, eq(counts.campId, camps.id))
    .where(and(ne(camps.status, "finished"), gte(camps.endDate, sql`current_date`)))
    .orderBy(asc(camps.startDate));
}

/** Os últimos acampamentos realizados de cada etapa (até `limit` por etapa). */
export async function recentCampsByStage(limit = 3) {
  await requireUser();
  const counts = participantCounts();
  const rows = await db
    .select(campColumns(counts))
    .from(camps)
    .innerJoin(stages, eq(stages.id, camps.stageId))
    .leftJoin(counts, eq(counts.campId, camps.id))
    .where(or(eq(camps.status, "finished"), lt(camps.endDate, sql`current_date`)))
    .orderBy(asc(stages.position), desc(camps.startDate));

  const byStage = new Map<string, { stageName: string; camps: typeof rows }>();
  for (const row of rows) {
    const group = byStage.get(row.stageId) ?? { stageName: row.stageName, camps: [] };
    if (group.camps.length < limit) group.camps.push(row);
    byStage.set(row.stageId, group);
  }
  return [...byStage.values()];
}

/** Tenda parada: sem avançar de etapa há mais que isso (e ainda antes da última etapa). */
export const STALLED_YEARS = 2;

/** Situações que pedem ação da secretaria. */
export async function attentionPoints() {
  await requireUser();
  // Famílias sem tenda que não estão inscritas num acampamento que forma tendas.
  const inFormingCamp = db
    .select()
    .from(campParticipants)
    .innerJoin(campParishes, eq(campParishes.campId, campParticipants.campId))
    .where(eq(campParticipants.familyId, families.id));

  // Último avanço da tenda: a etapa mais recente registrada ou a data de formação.
  const progress = db
    .select({ tentId: tentStageHistory.tentId, last: max(tentStageHistory.date).as("last") })
    .from(tentStageHistory)
    .groupBy(tentStageHistory.tentId)
    .as("progress");
  const lastProgress = sql<string>`greatest(${progress.last}, ${tents.formedAt})`;

  const [noGuardian, noStage, noTent, stalled] = await Promise.all([
    db.query.tents.findMany({
      where: and(eq(tents.status, "active"), isNull(tents.guardianFamilyId)),
      with: { parish: true },
      orderBy: asc(tents.number),
    }),
    db.query.tents.findMany({
      where: and(eq(tents.status, "active"), isNull(tents.currentStageId)),
      with: { parish: true },
      orderBy: asc(tents.number),
    }),
    db
      .select({ n: count() })
      .from(families)
      .where(and(isNull(families.tentId), notExists(inFormingCamp))),
    db
      .select({
        id: tents.id,
        number: tents.number,
        name: tents.name,
        parishName: parishes.name,
        stageName: stages.name,
        since: lastProgress.as("since"),
      })
      .from(tents)
      .innerJoin(parishes, eq(parishes.id, tents.parishId))
      .innerJoin(stages, eq(stages.id, tents.currentStageId))
      .leftJoin(progress, eq(progress.tentId, tents.id))
      .where(
        and(
          eq(tents.status, "active"),
          lt(stages.position, sql`(select max(${stages.position}) from ${stages})`),
          lt(lastProgress, sql`current_date - make_interval(years => ${STALLED_YEARS})`),
        ),
      )
      .orderBy(asc(lastProgress)),
  ]);
  return { noGuardian, noStage, familiesWithoutTent: noTent[0].n, stalled };
}

export async function parishSummary() {
  await requireUser();
  return db
    .select({
      id: parishes.id,
      name: parishes.name,
      tents: sql<number>`count(distinct ${tents.id}) filter (where ${tents.status} = 'active')`.mapWith(
        Number,
      ),
      families: sql<number>`count(distinct ${families.id}) filter (where ${tents.status} = 'active')`.mapWith(
        Number,
      ),
    })
    .from(parishes)
    .leftJoin(tents, eq(tents.parishId, parishes.id))
    .leftJoin(families, eq(families.tentId, tents.id))
    .where(eq(parishes.active, true))
    .groupBy(parishes.id, parishes.name)
    .orderBy(asc(parishes.name));
}
