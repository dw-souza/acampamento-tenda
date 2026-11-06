import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { campParticipants, camps, stages, tents } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { type ParticipantForSummary, summarizeCamp } from "@/lib/domain/camp-summary";

export async function listCamps() {
  await requireUser();
  const families = db
    .select({ campId: campParticipants.campId, n: count().as("n") })
    .from(campParticipants)
    .groupBy(campParticipants.campId)
    .as("families");

  return db
    .select({
      id: camps.id,
      name: camps.name,
      startDate: camps.startDate,
      endDate: camps.endDate,
      status: camps.status,
      stageName: stages.name,
      families: families.n,
    })
    .from(camps)
    .innerJoin(stages, eq(stages.id, camps.stageId))
    .leftJoin(families, eq(families.campId, camps.id))
    .orderBy(desc(camps.startDate));
}

// cache: layout e página do mesmo acampamento compartilham a consulta.
export const getCamp = cache(async (id: string) => {
  await requireUser();
  return db.query.camps.findFirst({
    where: eq(camps.id, id),
    with: {
      stage: true,
      parishes: { with: { parish: true, formingTent: true } },
      tents: { with: { tent: { with: { parish: true } }, team: true } },
    },
  });
});

export type Camp = NonNullable<Awaited<ReturnType<typeof getCamp>>>;

export const getCampParticipants = cache(async (campId: string) => {
  await requireUser();
  return db.query.campParticipants.findMany({
    where: eq(campParticipants.campId, campId),
    with: {
      family: { with: { people: true, tent: true, parish: true } },
      attendees: { with: { person: true } },
      team: true,
    },
  });
});

export type CampParticipant = Awaited<ReturnType<typeof getCampParticipants>>[number];

export function toSummaryInput(participant: CampParticipant): ParticipantForSummary {
  return {
    status: participant.status,
    paidCents: participant.paidCents,
    attendees: participant.attendees.map(({ person }) => ({ role: person.role, birthDate: person.birthDate })),
  };
}

export async function getCampTotals(camp: Camp) {
  const participants = await getCampParticipants(camp.id);
  return summarizeCamp(participants.map(toSummaryInput), camp);
}

export async function campStageOptions() {
  await requireUser();
  const rows = await db.query.stages.findMany({
    where: eq(stages.hasCamp, true),
    orderBy: asc(stages.position),
  });
  return rows.map((stage) => ({ value: stage.id, label: stage.name }));
}

/** Tendas ativas ainda não vinculadas, com as da etapa do acampamento primeiro. */
export async function tentsAvailableForCamp(camp: Camp) {
  await requireUser();
  const linked = new Set(camp.tents.map((link) => link.tentId));
  const rows = await db.query.tents.findMany({
    where: and(eq(tents.status, "active")),
    with: { parish: true, currentStage: true },
    orderBy: asc(tents.number),
  });
  return rows
    .filter((tent) => !linked.has(tent.id))
    .sort((a, b) => {
      const aSuggested = a.currentStage?.position === camp.stage.position - 1 ? 0 : 1;
      const bSuggested = b.currentStage?.position === camp.stage.position - 1 ? 0 : 1;
      return aSuggested - bSuggested || a.parish.name.localeCompare(b.parish.name) || a.number - b.number;
    })
    .map((tent) => ({
      ...tent,
      suggested: tent.currentStage?.position === camp.stage.position - 1,
    }));
}
