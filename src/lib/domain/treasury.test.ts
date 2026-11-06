import { describe, expect, it } from "vitest";
import { paymentStatus, treasuryTotals } from "./treasury";

describe("paymentStatus", () => {
  it.each([
    [25000, 0, "unpaid"],
    [25000, 10000, "partial"],
    [25000, 25000, "paid"],
    [25000, 30000, "paid"],
    [0, 0, "free"],
    [0, 5000, "paid"],
  ] as const)("esperado %i, pago %i -> %s", (expected, paid, status) => {
    expect(paymentStatus(expected, paid)).toBe(status);
  });
});

describe("treasuryTotals", () => {
  it("separa por função e forma de pagamento", () => {
    const totals = treasuryTotals([
      { role: "camper", method: "pix", expectedCents: 25000, paidCents: 25000 },
      { role: "camper", method: null, expectedCents: 25000, paidCents: 0 },
      { role: "server", method: "cash", expectedCents: 20000, paidCents: 30000 },
    ]);
    expect(totals).toEqual({
      expectedCents: 70000,
      paidCents: 55000,
      byRole: {
        camper: { expectedCents: 50000, paidCents: 25000 },
        server: { expectedCents: 20000, paidCents: 30000 },
      },
      byMethod: { pix: 25000, cash: 30000 },
      missingCents: 25000,
    });
  });
});
