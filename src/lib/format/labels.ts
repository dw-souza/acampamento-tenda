// Rótulos de exibição compartilhados entre telas.

export const tentStatusLabels = {
  forming: "Em formação",
  active: "Ativa",
  inactive: "Inativa",
} as const;

export const personStatusLabels = {
  active: "Ativo",
  deceased: "Falecido",
  left: "Saiu",
} as const;

export function tentLabel(tent: { number: number; name: string | null }) {
  return tent.name ? `Tenda ${tent.number} – ${tent.name}` : `Tenda ${tent.number}`;
}

type Person = { role: "husband" | "wife" | "child"; fullName: string };

export function coupleName(people: Person[]) {
  const husband = people.find((person) => person.role === "husband");
  const wife = people.find((person) => person.role === "wife");
  return [husband?.fullName, wife?.fullName].filter(Boolean).join(" e ") || "Família sem nome";
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** "1 família", "3 famílias". */
export function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

export function peopleSummary(totals: { families: number; adults: number; children: number }) {
  return [
    plural(totals.families, "família", "famílias"),
    plural(totals.adults, "adulto", "adultos"),
    plural(totals.children, "filho", "filhos"),
  ].join(" · ");
}
