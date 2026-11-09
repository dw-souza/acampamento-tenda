// Regras de valores de um acampamento, calculadas a partir de quem vai.
// O pagamento é um pedido, nunca uma condição: ninguém deixa de ir por não pagar.

export const FREE_CHILD_AGE = 3;

export type AttendeeForPricing = {
  role: "husband" | "wife" | "child";
  birthDate: string | null; // ISO yyyy-mm-dd
};

export type CampPrices = {
  startDate: string; // ISO yyyy-mm-dd
  adultPriceCents: number;
  childPriceCents: number;
};

/** Idade completa em anos numa data de referência (ambas ISO yyyy-mm-dd). */
export function ageOn(birthDate: string, onDate: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [y, m, d] = onDate.split("-").map(Number);
  const hadBirthday = m > bm || (m === bm && d >= bd);
  return y - by - (hadBirthday ? 0 : 1);
}

/** Criança com menos de 3 anos no início do acampamento: não paga e precisa de babá (pajem). */
export function isToddler(person: AttendeeForPricing, campStartDate: string): boolean {
  return (
    person.role === "child" &&
    person.birthDate !== null &&
    ageOn(person.birthDate, campStartDate) < FREE_CHILD_AGE
  );
}

export function expectedAmountCents(attendees: AttendeeForPricing[], camp: CampPrices): number {
  return attendees.reduce((total, person) => {
    if (person.role !== "child") return total + camp.adultPriceCents;
    if (isToddler(person, camp.startDate)) return total;
    return total + camp.childPriceCents;
  }, 0);
}

export function toddlerCount(attendees: AttendeeForPricing[], campStartDate: string): number {
  return attendees.filter((person) => isToddler(person, campStartDate)).length;
}
