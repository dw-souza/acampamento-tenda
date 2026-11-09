// Totais de um acampamento a partir das participações e de quem vai.
import { type AttendeeForPricing, type CampPrices, expectedAmountCents, isToddler } from "./pricing";

export type ParticipantStatus = "confirmed" | "waitlist" | "cancelled";
export type ParticipantRole = "camper" | "server";

/** Campistas e servos podem ter valores diferentes no mesmo acampamento. */
export type CampPricing = {
  startDate: string;
  adultPriceCents: number;
  childPriceCents: number;
  serverAdultPriceCents: number;
  serverChildPriceCents: number;
};

export function pricesFor(camp: CampPricing, role: ParticipantRole): CampPrices {
  return role === "camper"
    ? {
        startDate: camp.startDate,
        adultPriceCents: camp.adultPriceCents,
        childPriceCents: camp.childPriceCents,
      }
    : {
        startDate: camp.startDate,
        adultPriceCents: camp.serverAdultPriceCents,
        childPriceCents: camp.serverChildPriceCents,
      };
}

export type ParticipantForSummary = {
  role: ParticipantRole;
  status: ParticipantStatus;
  paidCents: number;
  nannyGoing: boolean | null;
  attendees: AttendeeForPricing[];
};

/**
 * Babá (pajem): quem leva criança com menos de 3 anos precisa informar se a babá vai.
 * - not_needed: nenhuma criança dessa idade vai
 * - pending: precisa informar
 * - going / not_going: informado
 */
export type NannyStatus = "not_needed" | "pending" | "going" | "not_going";

export function nannyStatus(
  participant: Pick<ParticipantForSummary, "nannyGoing" | "attendees">,
  campStartDate: string,
): NannyStatus {
  const needsNanny = participant.attendees.some((person) => isToddler(person, campStartDate));
  if (!needsNanny) return "not_needed";
  if (participant.nannyGoing === null) return "pending";
  return participant.nannyGoing ? "going" : "not_going";
}

export type Totals = {
  families: number;
  adults: number;
  children: number;
  /** Menores de 3 anos: não pagam e precisam de babá. */
  toddlers: number;
  /** Babás que vão (pessoas a mais no acampamento, não pagam). */
  nannies: number;
  /** Famílias com criança menor de 3 anos que ainda não informaram a babá. */
  nannyPending: number;
  expectedCents: number;
  paidCents: number;
};

/** Lista de espera e desistentes não contam para vagas, pessoas nem valores. */
export function countsTowardCamp(status: ParticipantStatus) {
  return status === "confirmed";
}

export function summarizeParticipant(participant: ParticipantForSummary, camp: CampPricing) {
  const prices = pricesFor(camp, participant.role);
  const adults = participant.attendees.filter((person) => person.role !== "child").length;
  const toddlers = participant.attendees.filter((person) => isToddler(person, camp.startDate)).length;
  const children = participant.attendees.length - adults;
  return {
    adults,
    children,
    toddlers,
    nanny: nannyStatus(participant, camp.startDate),
    expectedCents: countsTowardCamp(participant.status)
      ? expectedAmountCents(participant.attendees, prices)
      : 0,
  };
}

export function summarizeCamp(participants: ParticipantForSummary[], camp: CampPricing): Totals {
  const totals: Totals = {
    families: 0,
    adults: 0,
    children: 0,
    toddlers: 0,
    nannies: 0,
    nannyPending: 0,
    expectedCents: 0,
    paidCents: 0,
  };
  for (const participant of participants) {
    // O que já foi pago entra no caixa mesmo se a família cancelou depois.
    totals.paidCents += participant.paidCents;
    if (!countsTowardCamp(participant.status)) continue;
    const summary = summarizeParticipant(participant, camp);
    totals.families += 1;
    totals.adults += summary.adults;
    totals.children += summary.children;
    totals.toddlers += summary.toddlers;
    if (summary.nanny === "going") totals.nannies += 1;
    if (summary.nanny === "pending") totals.nannyPending += 1;
    totals.expectedCents += summary.expectedCents;
  }
  return totals;
}
