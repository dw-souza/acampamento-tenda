// Rótulos de exibição compartilhados entre telas.

export const tentStatusLabels = {
  forming: "Em formação",
  active: "Ativo",
  inactive: "Inativo",
} as const;

export const personStatusLabels = {
  active: "Ativo",
  deceased: "Falecido",
  left: "Saiu",
} as const;

/** Os tendas não têm nome: são conhecidos pelo número (e pela paróquia). */
export function tentLabel(tent: { number: number }) {
  return `TENDA ${tent.number}`;
}

type Person = { role: "husband" | "wife" | "child"; fullName: string };

export function coupleName(people: Person[]) {
  const husband = people.find((person) => person.role === "husband");
  const wife = people.find((person) => person.role === "wife");
  return [husband?.fullName, wife?.fullName].filter(Boolean).join(" e ") || "Família sem nome";
}

/**
 * Acampamentos são por temporada (vários Kerigmas entre fevereiro e abril, por exemplo):
 * o nome é a etapa e a data de início. A etapa em que nascem os tendas é o acampamento aberto.
 */
export function campLabel(camp: { startDate: string; stage: { name: string; formsTents: boolean } }) {
  return `${camp.stage.name}${camp.stage.formsTents ? " (ABERTO)" : ""} – ${formatDate(camp.startDate)}`;
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
