// Totais de um acampamento a partir das participações e de quem vai.
import { type AttendeeForPricing, type CampPrices, expectedAmountCents, isToddler } from "./pricing";

export type ParticipantStatus = "pending" | "confirmed" | "waitlist" | "cancelled";

export type ParticipantForSummary = {
  status: ParticipantStatus;
  paidCents: number;
  attendees: AttendeeForPricing[];
};

export type Totals = {
  families: number;
  adults: number;
  children: number;
  /** Menores de 3 anos: não pagam e ficam com o pajem. */
  toddlers: number;
  expectedCents: number;
  paidCents: number;
};

/** Lista de espera e cancelados não contam para vagas, pessoas nem valores. */
export function countsTowardCamp(status: ParticipantStatus) {
  return status === "pending" || status === "confirmed";
}

export function summarizeParticipant(participant: ParticipantForSummary, camp: CampPrices) {
  const adults = participant.attendees.filter((person) => person.role !== "child").length;
  const toddlers = participant.attendees.filter((person) => isToddler(person, camp.startDate)).length;
  const children = participant.attendees.length - adults;
  return {
    adults,
    children,
    toddlers,
    expectedCents: expectedAmountCents(participant.attendees, camp),
  };
}

export function summarizeCamp(participants: ParticipantForSummary[], camp: CampPrices): Totals {
  const totals: Totals = { families: 0, adults: 0, children: 0, toddlers: 0, expectedCents: 0, paidCents: 0 };
  for (const participant of participants) {
    // O que já foi pago entra no caixa mesmo se a família cancelou depois.
    totals.paidCents += participant.paidCents;
    if (!countsTowardCamp(participant.status)) continue;
    const summary = summarizeParticipant(participant, camp);
    totals.families += 1;
    totals.adults += summary.adults;
    totals.children += summary.children;
    totals.toddlers += summary.toddlers;
    totals.expectedCents += summary.expectedCents;
  }
  return totals;
}
