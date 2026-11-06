import type { getFamily } from "@/lib/data/families";
import type { FamilyInput } from "@/lib/validation/family";

type Family = NonNullable<Awaited<ReturnType<typeof getFamily>>>;
type Person = Family["people"][number];

const emptySpouse = {
  id: "",
  fullName: "",
  badgeName: "",
  birthDate: "",
  phone: "",
  email: "",
  profession: "",
  dietaryRestrictions: "",
  specialNeeds: "",
  status: "active",
} satisfies FamilyInput["husband"];

export function newFamilyValues(parishId = "", tentId = ""): FamilyInput {
  return {
    parishId,
    tentId,
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    weddingDate: "",
    mainContactRole: "husband",
    notes: "",
    husband: emptySpouse,
    wife: emptySpouse,
    children: [],
  };
}

function personValues(person: Person) {
  return {
    id: person.id,
    fullName: person.fullName,
    badgeName: person.badgeName ?? "",
    birthDate: person.birthDate ?? "",
    dietaryRestrictions: person.dietaryRestrictions ?? "",
    specialNeeds: person.specialNeeds ?? "",
    status: person.status,
  };
}

function spouseValues(person: Person | undefined): FamilyInput["husband"] {
  if (!person) return emptySpouse;
  return {
    ...personValues(person),
    phone: person.phone ?? "",
    email: person.email ?? "",
    profession: person.profession ?? "",
  };
}

export function familyValues(family: Family): FamilyInput {
  return {
    parishId: family.parishId,
    tentId: family.tentId ?? "",
    address: family.address ?? "",
    neighborhood: family.neighborhood ?? "",
    city: family.city ?? "",
    state: family.state ?? "",
    zipCode: family.zipCode ?? "",
    weddingDate: family.weddingDate ?? "",
    mainContactRole: family.mainContactRole === "wife" ? "wife" : "husband",
    notes: family.notes ?? "",
    husband: spouseValues(family.people.find((person) => person.role === "husband")),
    wife: spouseValues(family.people.find((person) => person.role === "wife")),
    children: family.people.filter((person) => person.role === "child").map(personValues),
  };
}
