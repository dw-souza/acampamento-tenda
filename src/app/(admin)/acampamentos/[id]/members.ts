import type { CampParticipant } from "@/lib/data/camps";
import { ageOn, isToddler } from "@/lib/domain/pricing";
import type { MemberOption } from "./campistas/participant-controls";

const roleOrder = { husband: 0, wife: 1, child: 2 } as const;

/** Membros da família com a marcação de quem vai, para as listas de campistas e equipes. */
export function memberOptions(participant: CampParticipant, campStartDate: string): MemberOption[] {
  const attending = new Set(participant.attendees.map((attendee) => attendee.personId));
  return participant.family.people
    .filter((person) => person.status === "active" || attending.has(person.id))
    .sort(
      (a, b) => roleOrder[a.role] - roleOrder[b.role] || (a.birthDate ?? "").localeCompare(b.birthDate ?? ""),
    )
    .map((person) => ({
      id: person.id,
      label: person.badgeName ?? person.fullName.split(" ")[0],
      attending: attending.has(person.id),
      detail:
        person.role === "child" && person.birthDate
          ? `${ageOn(person.birthDate, campStartDate)}a${isToddler(person, campStartDate) ? " · pajem" : ""}`
          : undefined,
    }));
}
