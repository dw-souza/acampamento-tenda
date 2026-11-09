import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

// forming: tenda criada junto com o Kerigma, ainda com inscrições abertas.
export const tentStatus = pgEnum("tent_status", ["forming", "active", "inactive"]);
export const personRole = pgEnum("person_role", ["husband", "wife", "child"]);
export const personStatus = pgEnum("person_status", ["active", "deceased", "left"]);
export const teamKind = pgEnum("team_kind", ["tent", "special"]);
// scheduled: tudo editável. finished: concluído (caminho dos tendas registrado e, no Kerigma,
// tendas formados); só "quem vai" e pagamentos continuam editáveis.
export const campStatus = pgEnum("camp_status", ["scheduled", "finished"]);
export const participantRole = pgEnum("participant_role", ["camper", "server"]);
// Só faz diferença no Kerigma: inscrita, lista de espera ou desistiu (cancelled).
export const participantStatus = pgEnum("participant_status", ["confirmed", "waitlist", "cancelled"]);
export const paymentMethod = pgEnum("payment_method", ["pix", "cash"]);

// ---------------------------------------------------------------------------
// Cadastros
// ---------------------------------------------------------------------------

export const parishes = pgTable("parishes", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  city: text().notNull(),
  state: text().notNull(),
  address: text(),
  zipCode: text(),
  phone: text(),
  email: text(),
  responsibleName: text(),
  responsiblePhone: text(),
  active: boolean().notNull().default(true),
  ...timestamps,
});

// Etapas do caminho, em ordem. hasCamp marca as que têm acampamento;
// as demais são só marcos na história do tenda.
export const stages = pgTable("stages", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  position: integer().notNull().unique(),
  hasCamp: boolean().notNull().default(false),
  // Etapa em que os tendas nascem (Kerigma): o acampamento é por paróquia,
  // com inscrição de famílias, e cada paróquia forma um tenda novo.
  formsTents: boolean().notNull().default(false),
  ...timestamps,
});

export const tents = pgTable(
  "tents",
  {
    id: uuid().primaryKey().defaultRandom(),
    parishId: uuid()
      .notNull()
      .references(() => parishes.id),
    number: integer().notNull(),
    status: tentStatus().notNull().default("forming"),
    currentStageId: uuid().references(() => stages.id),
    guardianFamilyId: uuid().references((): AnyPgColumn => families.id, {
      onDelete: "set null",
    }),
    meetingSchedule: text(),
    meetingLocation: text(),
    formedAt: date(),
    ...timestamps,
  },
  (t) => [unique().on(t.parishId, t.number)],
);

// A família é o casal (e filhos). Entra no Kerigma sempre como casal completo;
// depois pode se dissolver sem deixar o tenda, por isso os membros ficam em people.
export const families = pgTable(
  "families",
  {
    id: uuid().primaryKey().defaultRandom(),
    parishId: uuid()
      .notNull()
      .references(() => parishes.id),
    tentId: uuid().references(() => tents.id, { onDelete: "set null" }),
    address: text(),
    neighborhood: text(),
    city: text(),
    state: text(),
    zipCode: text(),
    weddingDate: date(),
    mainContactRole: personRole().notNull().default("husband"),
    notes: text(),
    ...timestamps,
  },
  (t) => [index().on(t.tentId), index().on(t.parishId)],
);

export const people = pgTable(
  "people",
  {
    id: uuid().primaryKey().defaultRandom(),
    familyId: uuid()
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    role: personRole().notNull(),
    fullName: text().notNull(),
    // Nome curto para o crachá; se vazio, usa o primeiro nome.
    badgeName: text(),
    birthDate: date(),
    phone: text(),
    email: text(),
    profession: text(),
    dietaryRestrictions: text(),
    specialNeeds: text(),
    status: personStatus().notNull().default("active"),
    ...timestamps,
  },
  (t) => [index().on(t.familyId)],
);

export const workTeams = pgTable("work_teams", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  // tent: um tenda inteiro serve (ex.: cozinha). special: casais avulsos (ex.: música).
  kind: teamKind().notNull(),
  color: text(),
  description: text(),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Acampamentos
// ---------------------------------------------------------------------------

export const camps = pgTable("camps", {
  id: uuid().primaryKey().defaultRandom(),
  stageId: uuid()
    .notNull()
    .references(() => stages.id),
  // Sem nome: o rótulo é a etapa + data de início (campLabel).
  startDate: date().notNull(),
  endDate: date().notNull(),
  // Valores em centavos, por pessoa. Crianças menores de 3 anos não pagam.
  // adult/child: campistas; serverAdult/serverChild: quem serve nas equipes.
  adultPriceCents: integer().notNull().default(0),
  childPriceCents: integer().notNull().default(0),
  serverAdultPriceCents: integer().notNull().default(0),
  serverChildPriceCents: integer().notNull().default(0),
  // Só referência (ex.: 16 famílias por paróquia); nunca bloqueia inscrição.
  expectedFamilies: integer(),
  status: campStatus().notNull().default("scheduled"),
  notes: text(),
  ...timestamps,
});

// Paróquias de um acampamento aberto (Kerigma). Cada uma forma a seu tenda.
export const campParishes = pgTable(
  "camp_parishes",
  {
    campId: uuid()
      .notNull()
      .references(() => camps.id, { onDelete: "cascade" }),
    parishId: uuid()
      .notNull()
      .references(() => parishes.id),
    formingTentId: uuid().references(() => tents.id, { onDelete: "set null" }),
  },
  (t) => [primaryKey({ columns: [t.campId, t.parishId] })],
);

// Tendas inteiras num acampamento: como campistas ou servindo numa equipe de tenda.
// Ao vincular, cada família do tenda vira um camp_participant.
export const campTents = pgTable(
  "camp_tents",
  {
    campId: uuid()
      .notNull()
      .references(() => camps.id, { onDelete: "cascade" }),
    tentId: uuid()
      .notNull()
      .references(() => tents.id),
    role: participantRole().notNull(),
    teamId: uuid().references(() => workTeams.id),
  },
  (t) => [primaryKey({ columns: [t.campId, t.tentId] })],
);

// Uma família tem uma única função por acampamento.
export const campParticipants = pgTable(
  "camp_participants",
  {
    id: uuid().primaryKey().defaultRandom(),
    campId: uuid()
      .notNull()
      .references(() => camps.id, { onDelete: "cascade" }),
    familyId: uuid()
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    role: participantRole().notNull(),
    teamId: uuid().references(() => workTeams.id),
    isCoordinator: boolean().notNull().default(false),
    status: participantStatus().notNull().default("confirmed"),
    paymentMethod: paymentMethod(),
    paidCents: integer().notNull().default(0),
    notes: text(),
    ...timestamps,
  },
  (t) => [unique().on(t.campId, t.familyId), index().on(t.campId)],
);

// Quem da família vai de fato (os dois, só um, com ou sem cada filho).
export const campAttendees = pgTable(
  "camp_attendees",
  {
    participantId: uuid()
      .notNull()
      .references(() => campParticipants.id, { onDelete: "cascade" }),
    personId: uuid()
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.participantId, t.personId] })],
);

// Quando o tenda passou por cada etapa.
export const tentStageHistory = pgTable(
  "tent_stage_history",
  {
    id: uuid().primaryKey().defaultRandom(),
    tentId: uuid()
      .notNull()
      .references(() => tents.id, { onDelete: "cascade" }),
    stageId: uuid()
      .notNull()
      .references(() => stages.id),
    campId: uuid().references(() => camps.id, { onDelete: "set null" }),
    date: date().notNull(),
    ...timestamps,
  },
  (t) => [unique().on(t.tentId, t.stageId)],
);

// ---------------------------------------------------------------------------
// Relations (para db.query.*.findMany({ with: ... }))
// ---------------------------------------------------------------------------

export const parishesRelations = relations(parishes, ({ many }) => ({
  tents: many(tents),
  families: many(families),
}));

export const stagesRelations = relations(stages, ({ many }) => ({
  camps: many(camps),
}));

export const tentsRelations = relations(tents, ({ one, many }) => ({
  parish: one(parishes, { fields: [tents.parishId], references: [parishes.id] }),
  currentStage: one(stages, { fields: [tents.currentStageId], references: [stages.id] }),
  guardianFamily: one(families, {
    fields: [tents.guardianFamilyId],
    references: [families.id],
    relationName: "guardian",
  }),
  families: many(families, { relationName: "members" }),
  stageHistory: many(tentStageHistory),
}));

export const familiesRelations = relations(families, ({ one, many }) => ({
  parish: one(parishes, { fields: [families.parishId], references: [parishes.id] }),
  tent: one(tents, {
    fields: [families.tentId],
    references: [tents.id],
    relationName: "members",
  }),
  people: many(people),
  participations: many(campParticipants),
}));

export const peopleRelations = relations(people, ({ one }) => ({
  family: one(families, { fields: [people.familyId], references: [families.id] }),
}));

export const campsRelations = relations(camps, ({ one, many }) => ({
  stage: one(stages, { fields: [camps.stageId], references: [stages.id] }),
  parishes: many(campParishes),
  tents: many(campTents),
  participants: many(campParticipants),
}));

export const campParishesRelations = relations(campParishes, ({ one }) => ({
  camp: one(camps, { fields: [campParishes.campId], references: [camps.id] }),
  parish: one(parishes, { fields: [campParishes.parishId], references: [parishes.id] }),
  formingTent: one(tents, { fields: [campParishes.formingTentId], references: [tents.id] }),
}));

export const campTentsRelations = relations(campTents, ({ one }) => ({
  camp: one(camps, { fields: [campTents.campId], references: [camps.id] }),
  tent: one(tents, { fields: [campTents.tentId], references: [tents.id] }),
  team: one(workTeams, { fields: [campTents.teamId], references: [workTeams.id] }),
}));

export const campParticipantsRelations = relations(campParticipants, ({ one, many }) => ({
  camp: one(camps, { fields: [campParticipants.campId], references: [camps.id] }),
  family: one(families, { fields: [campParticipants.familyId], references: [families.id] }),
  team: one(workTeams, { fields: [campParticipants.teamId], references: [workTeams.id] }),
  attendees: many(campAttendees),
}));

export const campAttendeesRelations = relations(campAttendees, ({ one }) => ({
  participant: one(campParticipants, {
    fields: [campAttendees.participantId],
    references: [campParticipants.id],
  }),
  person: one(people, { fields: [campAttendees.personId], references: [people.id] }),
}));

export const tentStageHistoryRelations = relations(tentStageHistory, ({ one }) => ({
  tent: one(tents, { fields: [tentStageHistory.tentId], references: [tents.id] }),
  stage: one(stages, { fields: [tentStageHistory.stageId], references: [stages.id] }),
  camp: one(camps, { fields: [tentStageHistory.campId], references: [camps.id] }),
}));
