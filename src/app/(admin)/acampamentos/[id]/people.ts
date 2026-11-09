import type { Camp, CampParticipant } from "@/lib/data/camps";
import { countsTowardCamp } from "@/lib/domain/camp-summary";
import { ageOn, isToddler } from "@/lib/domain/pricing";
import { coupleName, tentLabel } from "@/lib/format/labels";

type Person = CampParticipant["family"]["people"][number];

export type CampPerson = {
  id: string;
  familyId: string;
  fullName: string;
  /** Nome em destaque no crachá. */
  displayName: string;
  role: Person["role"];
  participantRole: "camper" | "server";
  /** Tenda (ou paróquia, no Kerigma) para campistas; equipe para quem serve. */
  group: string;
  groupColor: string | null;
  isCoordinator: boolean;
  spouseName: string | null;
  parentsNames: string | null;
  age: number | null;
  toddler: boolean;
  dietaryRestrictions: string | null;
  specialNeeds: string | null;
  familyName: string;
};

export function displayName(person: Pick<Person, "badgeName" | "fullName">) {
  return person.badgeName ?? person.fullName.split(" ")[0];
}

/** Todas as pessoas que vão ao acampamento (inscrições que contam), já com grupo e vínculos. */
export function campPeople(camp: Camp, participants: CampParticipant[]): CampPerson[] {
  return participants
    .filter((participant) => countsTowardCamp(participant.status))
    .flatMap((participant) => {
      const { family } = participant;
      const people = family.people;
      const husband = people.find((person) => person.role === "husband");
      const wife = people.find((person) => person.role === "wife");
      const parents = [husband, wife]
        .filter((parent): parent is Person => !!parent && parent.status === "active")
        .map(displayName)
        .join(" e ");

      // No Kerigma o número do tenda só é revelado no fim: o crachá mostra a paróquia.
      const camperGroup =
        camp.stage.formsTents || !family.tent ? family.parish.name : tentLabel(family.tent).toUpperCase();
      const group = participant.role === "camper" ? camperGroup : (participant.team?.name ?? "EQUIPE");

      return participant.attendees.map(({ person }) => {
        const spouse = person.role === "husband" ? wife : person.role === "wife" ? husband : undefined;
        return {
          id: person.id,
          familyId: family.id,
          fullName: person.fullName,
          displayName: displayName(person),
          role: person.role,
          participantRole: participant.role,
          group,
          groupColor: participant.role === "server" ? (participant.team?.color ?? null) : null,
          isCoordinator: participant.isCoordinator && person.role !== "child",
          spouseName: spouse && spouse.status === "active" ? displayName(spouse) : null,
          parentsNames: person.role === "child" ? parents || null : null,
          age: person.birthDate ? ageOn(person.birthDate, camp.startDate) : null,
          toddler: isToddler(person, camp.startDate),
          dietaryRestrictions: person.dietaryRestrictions,
          specialNeeds: person.specialNeeds,
          familyName: coupleName(people),
        };
      });
    });
}

const roleOrder = { husband: 0, wife: 1, child: 2 } as const;

/** Campistas primeiro, depois equipes; dentro do grupo, por família. */
export function sortByGroup(people: CampPerson[]) {
  return [...people].sort(
    (a, b) =>
      Number(a.participantRole === "server") - Number(b.participantRole === "server") ||
      a.group.localeCompare(b.group) ||
      a.familyName.localeCompare(b.familyName) ||
      roleOrder[a.role] - roleOrder[b.role] ||
      (b.age ?? 0) - (a.age ?? 0),
  );
}
