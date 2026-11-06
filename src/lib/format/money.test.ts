import { describe, expect, it } from "vitest";
import { centsToInput, formatMoney, parseMoney } from "./money";

describe("parseMoney", () => {
  it.each([
    ["125", 12500],
    ["125,5", 12550],
    ["125,50", 12550],
    ["1.250,50", 125050],
    ["125.50", 12550],
    ["R$ 25,00", 2500],
    ["0", 0],
  ])("%s -> %i", (input, cents) => {
    expect(parseMoney(input)).toBe(cents);
  });

  it.each(["", "abc", "12,345", "-5", "1,2,3"])("rejeita %j", (input) => {
    expect(parseMoney(input)).toBeNull();
  });
});

describe("formatação", () => {
  it("formata em reais", () => {
    expect(formatMoney(125050).replace(/\s/g, " ")).toBe("R$ 1.250,50");
  });

  it("gera valor para input", () => {
    expect(centsToInput(2500)).toBe("25,00");
  });
});
