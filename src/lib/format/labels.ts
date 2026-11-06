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
