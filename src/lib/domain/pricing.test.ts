import { describe, expect, it } from "vitest";
import { ageOn, expectedAmountCents, isToddler, toddlerCount } from "./pricing";

const camp = { startDate: "2026-07-10", adultPriceCents: 12500, childPriceCents: 2500 };

describe("ageOn", () => {
  it("conta o aniversário no próprio dia", () => {
    expect(ageOn("2023-07-10", "2026-07-10")).toBe(3);
  });

  it("não conta antes do aniversário", () => {
    expect(ageOn("2023-07-11", "2026-07-10")).toBe(2);
  });
});

describe("expectedAmountCents", () => {
  it("cobra o casal por pessoa", () => {
    const couple = [
      { role: "husband" as const, birthDate: null },
      { role: "wife" as const, birthDate: null },
    ];
    expect(expectedAmountCents(couple, camp)).toBe(25000);
  });

  it("cobra só quem vai quando um dos cônjuges não vai", () => {
    expect(expectedAmountCents([{ role: "wife", birthDate: null }], camp)).toBe(12500);
  });

  it("cobra filhos a partir de 3 anos e isenta os menores", () => {
    const family = [
      { role: "husband" as const, birthDate: null },
      { role: "wife" as const, birthDate: null },
      { role: "child" as const, birthDate: "2015-01-01" },
      { role: "child" as const, birthDate: "2023-07-10" }, // faz 3 no primeiro dia
      { role: "child" as const, birthDate: "2024-05-01" }, // 2 anos
    ];
    expect(expectedAmountCents(family, camp)).toBe(25000 + 2500 + 2500);
  });

  it("cobra filho sem data de nascimento como criança pagante", () => {
    expect(expectedAmountCents([{ role: "child", birthDate: null }], camp)).toBe(2500);
  });
});

describe("pajem", () => {
  it("conta só crianças menores de 3 anos", () => {
    const kids = [
      { role: "child" as const, birthDate: "2024-05-01" },
      { role: "child" as const, birthDate: "2020-05-01" },
      { role: "child" as const, birthDate: null },
    ];
    expect(toddlerCount(kids, camp.startDate)).toBe(1);
    expect(isToddler({ role: "wife", birthDate: "2024-05-01" }, camp.startDate)).toBe(false);
  });
});
