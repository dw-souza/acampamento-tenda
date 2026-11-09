import { describe, expect, it } from "vitest";
import { nannyStatus, summarizeCamp, summarizeParticipant } from "./camp-summary";

const camp = {
  startDate: "2026-07-10",
  adultPriceCents: 12500,
  childPriceCents: 2500,
  serverAdultPriceCents: 10000,
  serverChildPriceCents: 2000,
};
const couple = [
  { role: "husband" as const, birthDate: null },
  { role: "wife" as const, birthDate: null },
];

describe("summarizeCamp", () => {
  it("soma famílias, pessoas e valores de quem conta", () => {
    const totals = summarizeCamp(
      [
        {
          role: "camper",
          status: "confirmed",
          paidCents: 10000,
          nannyGoing: true,
          attendees: [
            ...couple,
            { role: "child", birthDate: "2015-01-01" },
            { role: "child", birthDate: "2025-01-01" },
          ],
        },
        {
          role: "camper",
          status: "confirmed",
          paidCents: 0,
          nannyGoing: null,
          attendees: [{ role: "wife", birthDate: null }],
        },
      ],
      camp,
    );
    expect(totals).toEqual({
      families: 2,
      adults: 3,
      children: 2,
      toddlers: 1,
      nannies: 1,
      nannyPending: 0,
      expectedCents: 25000 + 2500 + 12500,
      paidCents: 10000,
    });
  });

  it("ignora lista de espera e cancelados, mas mantém o que já foi pago", () => {
    const totals = summarizeCamp(
      [
        { role: "camper", status: "waitlist", paidCents: 0, nannyGoing: null, attendees: couple },
        { role: "camper", status: "cancelled", paidCents: 5000, nannyGoing: null, attendees: couple },
      ],
      camp,
    );
    expect(totals).toMatchObject({ families: 0, adults: 0, expectedCents: 0, paidCents: 5000 });
  });

  it("usa o valor de servo para quem serve", () => {
    const summary = summarizeParticipant(
      {
        role: "server",
        status: "confirmed",
        paidCents: 0,
        nannyGoing: null,
        attendees: [...couple, { role: "child", birthDate: "2015-01-01" }],
      },
      camp,
    );
    expect(summary.expectedCents).toBe(10000 * 2 + 2000);
  });

  it("não espera valor de quem cancelou", () => {
    const summary = summarizeParticipant(
      { role: "camper", status: "cancelled", paidCents: 0, nannyGoing: null, attendees: couple },
      camp,
    );
    expect(summary.expectedCents).toBe(0);
  });
});

describe("babá", () => {
  const baby = { role: "child" as const, birthDate: "2025-01-01" };
  const teen = { role: "child" as const, birthDate: "2012-01-01" };

  it("não precisa sem criança menor de 3 anos indo", () => {
    expect(nannyStatus({ nannyGoing: null, attendees: [...couple, teen] }, camp.startDate)).toBe(
      "not_needed",
    );
  });

  it("fica pendente até informar, com criança pequena indo", () => {
    expect(nannyStatus({ nannyGoing: null, attendees: [...couple, baby] }, camp.startDate)).toBe("pending");
    expect(nannyStatus({ nannyGoing: true, attendees: [...couple, baby] }, camp.startDate)).toBe("going");
    expect(nannyStatus({ nannyGoing: false, attendees: [...couple, baby] }, camp.startDate)).toBe(
      "not_going",
    );
  });

  it("conta babás e pendências só de quem vai", () => {
    const totals = summarizeCamp(
      [
        { role: "camper", status: "confirmed", paidCents: 0, nannyGoing: true, attendees: [...couple, baby] },
        { role: "server", status: "confirmed", paidCents: 0, nannyGoing: null, attendees: [...couple, baby] },
        { role: "camper", status: "confirmed", paidCents: 0, nannyGoing: true, attendees: couple }, // bebê não vai
        { role: "camper", status: "waitlist", paidCents: 0, nannyGoing: null, attendees: [...couple, baby] },
      ],
      camp,
    );
    expect(totals).toMatchObject({ nannies: 1, nannyPending: 1, toddlers: 2 });
  });
});
