import "server-only";
import { and, asc, count, desc, eq, isNotNull, notExists, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import {
  campParishes,
  campParticipants,
  camps,
  campTents,
  families,
  parishes,
  stages,
  tents,
} from "@/db/schema";
import { requireUser } from "@/lib/dal";
import type { ParticipantForSummary } from "@/lib/domain/camp-summary";
import { canServe } from "@/lib/domain/eligibility";
import { coupleName, tentLabel } from "@/lib/format/labels";

/**
 * Tendas campistas do acampamento, "TENDA 3 – SANTA GIANNA, ...": no acampamento aberto são os
 * tendas em formação de cada paróquia; nos demais, os tendas vinculados como campistas.
 */
export function camperTentsLabel() {
  return sql<string | null>`(
    select string_agg('TENDA ' || ${tents.number} || ' – ' || ${parishes.name}, ', '
      order by ${parishes.name}, ${tents.number})
    from ${tents} join ${parishes} on ${parishes.id} = ${tents.parishId}
    where ${tents.id} in (
      select ${campParishes.formingTentId} from ${campParishes} where ${campParishes.campId} = ${camps.id}
      union
      select ${campTents.tentId} from ${campTents}
      where ${campTents.campId} = ${camps.id} and ${campTents.role} = 'camper'
    )
  )`;
}

/** stageId opcional filtra por etapa. */
export async function listCamps(filters: { stageId?: string } = {}) {
  await requireUser();
  const families = db
    .select({ campId: campParticipants.campId, n: count().as("n") })
    .from(campParticipants)
    .groupBy(campParticipants.campId)
    .as("families");

  return db
    .select({
      id: camps.id,
      startDate: camps.startDate,
      endDate: camps.endDate,
      status: camps.status,
      stageName: stages.name,
      stageFormsTents: stages.formsTents,
      families: families.n,
      camperTents: camperTentsLabel(),
    })
    .from(camps)
    .innerJoin(stages, eq(stages.id, camps.stageId))
    .leftJoin(families, eq(families.campId, camps.id))
    .where(filters.stageId ? eq(camps.stageId, filters.stageId) : undefined)
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
    role: participant.role,
    status: participant.status,
    paidCents: participant.paidCents,
    attendees: participant.attendees.map(({ person }) => ({
      role: person.role,
      birthDate: person.birthDate,
    })),
  };
}

export async function campStageOptions() {
  await requireUser();
  const rows = await db.query.stages.findMany({
    where: eq(stages.hasCamp, true),
    orderBy: asc(stages.position),
  });
  return rows.map((stage) => ({ value: stage.id, label: stage.name }));
}

/** Tendas ativos ainda não vinculados, com os da etapa do acampamento primeiro. */
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

/** Tendas que podem servir: ativos, ainda sem vínculo e que já passaram pela etapa do acampamento. */
export async function tentsEligibleToServe(camp: Camp) {
  const tents = await tentsAvailableForCamp(camp);
  return tents.filter((tent) => canServe(tent.currentStage?.position, camp.stage.position));
}

/** Famílias que podem servir: tenda ativo que já passou pela etapa e ainda sem função no acampamento. */
export async function familiesEligibleToServe(camp: Camp) {
  const campId = camp.id;
  await requireUser();
  const rows = await db.query.families.findMany({
    where: and(
      isNotNull(families.tentId),
      notExists(
        db
          .select()
          .from(campParticipants)
          .where(and(eq(campParticipants.campId, campId), eq(campParticipants.familyId, families.id))),
      ),
    ),
    with: { people: true, tent: { with: { currentStage: true } }, parish: true },
  });
  return rows
    .filter(
      (family) =>
        family.tent?.status === "active" && canServe(family.tent.currentStage?.position, camp.stage.position),
    )
    .map((family) => ({
      value: family.id,
      label: `${coupleName(family.people)} · ${tentLabel(family.tent!)} · ${family.parish.name}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
