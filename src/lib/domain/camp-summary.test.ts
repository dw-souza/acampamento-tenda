import { describe, expect, it } from "vitest";
import { summarizeCamp, summarizeParticipant } from "./camp-summary";

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
          attendees: [
            ...couple,
            { role: "child", birthDate: "2015-01-01" },
            { role: "child", birthDate: "2025-01-01" },
          ],
        },
        { role: "camper", status: "pending", paidCents: 0, attendees: [{ role: "wife", birthDate: null }] },
      ],
      camp,
    );
    expect(totals).toEqual({
      families: 2,
      adults: 3,
      children: 2,
      toddlers: 1,
      expectedCents: 25000 + 2500 + 12500,
      paidCents: 10000,
    });
  });

  it("ignora lista de espera e cancelados, mas mantém o que já foi pago", () => {
    const totals = summarizeCamp(
      [
        { role: "camper", status: "waitlist", paidCents: 0, attendees: couple },
        { role: "camper", status: "cancelled", paidCents: 5000, attendees: couple },
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
        attendees: [...couple, { role: "child", birthDate: "2015-01-01" }],
      },
      camp,
    );
    expect(summary.expectedCents).toBe(10000 * 2 + 2000);
  });

  it("não espera valor de quem cancelou", () => {
    const summary = summarizeParticipant(
      { role: "camper", status: "cancelled", paidCents: 0, attendees: couple },
      camp,
    );
    expect(summary.expectedCents).toBe(0);
  });
});
