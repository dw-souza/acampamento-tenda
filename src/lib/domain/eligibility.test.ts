import { describe, expect, it } from "vitest";
import { canServe } from "./eligibility";

describe("canServe", () => {
  const koinonia = 8;
  it("aceita quem já está na etapa ou depois dela", () => {
    expect(canServe(8, koinonia)).toBe(true);
    expect(canServe(9, koinonia)).toBe(true);
  });

  it("recusa quem ainda não chegou na etapa", () => {
    expect(canServe(7, koinonia)).toBe(false);
  });

  it("recusa tenda sem etapa registrada", () => {
    expect(canServe(null, 1)).toBe(false);
  });
});
