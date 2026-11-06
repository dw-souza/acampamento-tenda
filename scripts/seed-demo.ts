// Dados de demonstração: paróquias, tendas, famílias e acampamentos (passados e próximos).
// Usa as etapas e equipes já cadastradas (rode db:seed antes) e não roda se já houver paróquias.
// Uso: npm run db:seed:demo   (local)   |   npm run prod:seed:demo   (banco da Vercel/Neon)
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { canServe } from "@/lib/domain/eligibility";
import { type AttendeeForPricing, expectedAmountCents } from "@/lib/domain/pricing";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Stage = typeof schema.stages.$inferSelect;
type Team = typeof schema.workTeams.$inferSelect;
type PersonRow = typeof schema.people.$inferInsert & { id: string };

// ---------------------------------------------------------------------------
// Aleatoriedade reproduzível
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261106);
const pick = <T>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
const chance = (p: number) => rand() < p;
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const shuffle = <T>(items: T[]) =>
  items
    .map((item) => [rand(), item] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, item]) => item);

// ---------------------------------------------------------------------------
// Datas (ISO yyyy-mm-dd)
// ---------------------------------------------------------------------------

const today = new Date().toISOString().slice(0, 10);
const thisYear = Number(today.slice(0, 4));

function addMonths(isoDate: string, months: number, day = 10) {
  const [y, m] = isoDate.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function randomDate(from: string, to: string) {
  const start = Date.parse(`${from}T12:00:00Z`);
  const end = Date.parse(`${to}T12:00:00Z`);
  return new Date(start + rand() * Math.max(0, end - start)).toISOString().slice(0, 10);
}

// Meses depois do Kerigma (julho do ano de formação) em que cada etapa acontece, pela posição.
const STAGE_OFFSETS = [0, 8, 13, 19, 26, 32, 38, 52, 59];
const stageOffset = (index: number) => STAGE_OFFSETS[index] ?? 59 + (index - 8) * 6;
const kerigmaDate = (year: number) => `${year}-07-10`;

// ---------------------------------------------------------------------------
// Nomes e dados pessoais
// ---------------------------------------------------------------------------

const MEN = [
  "JOÃO",
  "PEDRO",
  "LUCAS",
  "MATEUS",
  "GABRIEL",
  "RAFAEL",
  "FELIPE",
  "GUSTAVO",
  "BRUNO",
  "RODRIGO",
  "MARCELO",
  "ANDRÉ",
  "RICARDO",
  "FERNANDO",
  "PAULO",
  "CARLOS",
  "EDUARDO",
  "DIEGO",
  "THIAGO",
  "LEANDRO",
  "FÁBIO",
  "MARCOS",
  "ANTÔNIO",
  "JOSÉ",
  "DANIEL",
  "VINÍCIUS",
  "RENATO",
  "SÉRGIO",
  "ALEXANDRE",
  "LUIZ",
];
const WOMEN = [
  "MARIA",
  "ANA",
  "JULIANA",
  "FERNANDA",
  "PATRÍCIA",
  "CAMILA",
  "AMANDA",
  "LETÍCIA",
  "BEATRIZ",
  "MARIANA",
  "GABRIELA",
  "LARISSA",
  "VANESSA",
  "ALINE",
  "PRISCILA",
  "RENATA",
  "CAROLINA",
  "TATIANE",
  "ADRIANA",
  "SIMONE",
  "CLÁUDIA",
  "LUCIANA",
  "DÉBORA",
  "NATÁLIA",
  "BRUNA",
  "ISABELA",
  "RAQUEL",
  "SANDRA",
  "CRISTINA",
  "MÔNICA",
];
const BOYS = [
  "MIGUEL",
  "ARTHUR",
  "HEITOR",
  "THEO",
  "DAVI",
  "BERNARDO",
  "SAMUEL",
  "LORENZO",
  "BENJAMIN",
  "NICOLAS",
  "ENZO",
  "JOAQUIM",
  "RAFAEL",
  "LUCAS",
  "GAEL",
  "PEDRO",
  "BENTO",
  "JOSÉ",
  "TOMÁS",
  "FRANCISCO",
];
const GIRLS = [
  "HELENA",
  "ALICE",
  "LAURA",
  "VALENTINA",
  "SOPHIA",
  "CECÍLIA",
  "MANUELA",
  "LÍVIA",
  "CLARA",
  "ELISA",
  "LUÍSA",
  "HELOÍSA",
  "MARIA EDUARDA",
  "ANTONELLA",
  "LARA",
  "JÚLIA",
  "ISIS",
  "LIZ",
  "AURORA",
  "TERESA",
];
const SURNAMES = [
  "SILVA",
  "SANTOS",
  "OLIVEIRA",
  "SOUZA",
  "RODRIGUES",
  "FERREIRA",
  "ALVES",
  "PEREIRA",
  "LIMA",
  "GOMES",
  "COSTA",
  "RIBEIRO",
  "MARTINS",
  "CARVALHO",
  "ALMEIDA",
  "LOPES",
  "SOARES",
  "FERNANDES",
  "VIEIRA",
  "BARBOSA",
  "ROCHA",
  "DIAS",
  "NASCIMENTO",
  "ANDRADE",
  "MOREIRA",
  "NUNES",
  "MARQUES",
  "MACHADO",
  "MENDES",
  "FREITAS",
  "CARDOSO",
  "RAMOS",
  "GONÇALVES",
  "SANTANA",
  "TEIXEIRA",
];
const NEIGHBORHOODS = [
  "CENTRO",
  "JARDIM PETRÁGLIA",
  "CITY PETRÓPOLIS",
  "VILA SÃO SEBASTIÃO",
  "JARDIM NOVA AMÉRICA",
  "PARQUE DAS ESMERALDAS",
  "JARDIM AEROPORTO",
  "SÃO JOSÉ",
  "VILA HÍPICA",
  "JARDIM ÁLVARO GUIMARÃES",
  "JARDIM CALIFÓRNIA",
  "RESIDENCIAL AMAZONAS",
];
const STREETS = [
  "RUA MAJOR CLAUDIANO",
  "RUA VOLUNTÁRIOS DA FRANCA",
  "AV. DR. ISMAEL ALONSO Y ALONSO",
  "RUA DO COMÉRCIO",
  "RUA CAMPOS SALES",
  "RUA GENERAL TELLES",
  "AV. PRESIDENTE VARGAS",
  "RUA JÚLIO CARDOSO",
  "RUA SÃO SEBASTIÃO",
  "AV. CHAMPAGNAT",
];
const PROFESSIONS = [
  "PROFESSOR(A)",
  "ENFERMEIRO(A)",
  "ENGENHEIRO(A)",
  "ADVOGADO(A)",
  "COMERCIANTE",
  "SAPATEIRO(A)",
  "CONTADOR(A)",
  "VENDEDOR(A)",
  "ADMINISTRADOR(A)",
  "MOTORISTA",
  "MÉDICO(A)",
  "DO LAR",
  "AUTÔNOMO(A)",
  "ANALISTA DE SISTEMAS",
  "DESIGNER DE CALÇADOS",
  "FARMACÊUTICO(A)",
  "PSICÓLOGO(A)",
  "EMPRESÁRIO(A)",
];
const DIETS = [
  "Intolerância a lactose",
  "Doença celíaca (sem glúten)",
  "Vegetariano(a)",
  "Alergia a amendoim",
  "Diabético(a)",
  "Alergia a frutos do mar",
];
const CHILD_NEEDS = [
  "TDAH, precisa de acompanhamento nas atividades",
  "Usa bombinha para asma",
  "Autismo (TEA), evitar barulho excessivo",
  "Alergia a picada de inseto",
  "Epilepsia controlada, medicação às 20h",
];
const TENT_NAMES = [
  "SHALOM",
  "EMANUEL",
  "BETÂNIA",
  "NAZARÉ",
  "CANÁ",
  "BETEL",
  "HEBROM",
  "EFRATA",
  "SIÃO",
  "MAANAIM",
  "GETSÊMANI",
  "TABOR",
  "JERICÓ",
  "SILOÉ",
  "BELÉM",
];

const phone = () => `(16) 9${int(8000, 9999)}-${int(1000, 9999)}`;
const emailOf = (first: string, last: string) =>
  `${first}.${last}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "") + "@exemplo.com.br";

// ---------------------------------------------------------------------------
// Estrutura da comunidade
// ---------------------------------------------------------------------------

// Anos de formação das tendas (relativos ao ano atual).
const PARISHES = [
  {
    name: "SANTA GIANNA BERETTA MOLLA",
    address: "RUA DOS PIONEIROS, 1200",
    responsible: "PE. MARCELO AUGUSTO",
    years: [-7, -7, -6, -5, -4, -4, -3, -2, -1, 0],
  },
  {
    name: "SÃO JOSÉ",
    address: "PRAÇA SÃO JOSÉ, 50",
    responsible: "PE. RAFAEL MENDES",
    years: [-6, -5, -3, -2, -1, 0],
  },
  {
    name: "NOSSA SENHORA DA CONCEIÇÃO",
    address: "PRAÇA NOSSA SENHORA DA CONCEIÇÃO, S/N",
    responsible: "PE. JOSÉ ANTÔNIO",
    years: [-5, -4, -2, -1],
  },
  {
    name: "SÃO SEBASTIÃO",
    address: "AV. SÃO SEBASTIÃO, 980",
    responsible: "PE. LUCAS FERREIRA",
    years: [-3, -1],
  },
] as const;

type TentPlan = {
  id: string;
  parishId: string;
  parishName: string;
  number: number;
  year: number;
  status: "active" | "inactive";
  /** Etapas (índice) e datas em que a tenda passou, até hoje. */
  history: { stageIndex: number; date: string }[];
  /** Próxima etapa prevista (pode ser no futuro). */
  next: { stageIndex: number; date: string } | null;
  familyIds: string[];
};

// ---------------------------------------------------------------------------
// Famílias
// ---------------------------------------------------------------------------

type FamilyPlan = {
  id: string;
  parishId: string;
  tentId: string | null;
  weddingDate: string;
  people: PersonRow[];
};

function planFamily(
  parishId: string,
  tentId: string | null,
  formationYear: number,
  oldTent: boolean,
): FamilyPlan {
  const familyId = crypto.randomUUID();
  const husbandFirst = chance(0.3) ? `${pick(MEN)} ${pick(MEN)}` : pick(MEN);
  const wifeFirst = chance(0.3) ? `${pick(WOMEN)} ${pick(WOMEN)}` : pick(WOMEN);
  const husbandLast = `${pick(SURNAMES)} ${pick(SURNAMES)}`;
  const wifeMaiden = pick(SURNAMES);
  const familyLast = husbandLast.split(" ")[1];
  const husbandBirth = randomDate(`${formationYear - 45}-01-01`, `${formationYear - 28}-12-31`);
  const wifeBirth = addDays(husbandBirth, int(-1500, 1800));
  const wedding = randomDate(`${formationYear - 20}-01-01`, `${formationYear - 5}-12-31`);

  const spouse = (role: "husband" | "wife", first: string, last: string, birthDate: string): PersonRow => ({
    id: crypto.randomUUID(),
    familyId,
    role,
    fullName: `${first} ${last}`,
    badgeName: first.includes(" ") && chance(0.4) ? first.split(" ")[0] : null,
    birthDate,
    phone: phone(),
    email: chance(0.85) ? emailOf(first.split(" ")[0], last.split(" ").at(-1)!) : null,
    profession: pick(PROFESSIONS),
    dietaryRestrictions: chance(0.07) ? pick(DIETS) : null,
    status: "active",
  });
  const people = [
    spouse("husband", husbandFirst, husbandLast, husbandBirth),
    spouse("wife", wifeFirst, `${wifeMaiden} ${familyLast}`, wifeBirth),
  ];

  // Filhos nascidos depois do casamento; tendas novas têm mais bebês.
  const kids = pick([0, 1, 1, 2, 2, 2, 3, 3, 4]);
  for (let i = 0; i < kids; i++) {
    const boy = chance(0.5);
    // Idade uniforme entre 0 e 17 anos, mas sempre depois do casamento.
    const earliest = addDays(wedding, 300);
    const byAge = addDays(today, -int(60, 18 * 365));
    const birthDate = byAge >= earliest ? byAge : randomDate(earliest, addDays(today, -60));
    people.push({
      id: crypto.randomUUID(),
      familyId,
      role: "child",
      fullName: `${boy ? pick(BOYS) : pick(GIRLS)} ${wifeMaiden} ${familyLast}`,
      badgeName: null,
      birthDate,
      dietaryRestrictions: chance(0.06) ? pick(DIETS) : null,
      specialNeeds: chance(0.05) ? pick(CHILD_NEEDS) : null,
      status: "active",
    });
  }

  // Raros: viuvez e separação (a família continua na tenda).
  if (oldTent && chance(0.02)) people[0].status = "deceased";
  else if (oldTent && chance(0.015)) people[0].status = "left";

  return { id: familyId, parishId, tentId, weddingDate: wedding, people };
}

function familyRow(plan: FamilyPlan): typeof schema.families.$inferInsert {
  return {
    id: plan.id,
    parishId: plan.parishId,
    tentId: plan.tentId,
    address: `${pick(STREETS)}, ${int(10, 2500)}`,
    neighborhood: pick(NEIGHBORHOODS),
    city: "FRANCA",
    state: "SP",
    zipCode: `144${int(0, 9)}${int(0, 9)}-${String(int(0, 999)).padStart(3, "0")}`,
    weddingDate: plan.weddingDate,
    mainContactRole: chance(0.6) ? "wife" : "husband",
    notes: chance(0.05) ? "Prefere contato por WhatsApp." : null,
  };
}

// ---------------------------------------------------------------------------
// Participação em acampamentos
// ---------------------------------------------------------------------------

type CampCtx = {
  id: string;
  stageIndex: number;
  startDate: string;
  adultPriceCents: number;
  childPriceCents: number;
  serverAdultPriceCents: number;
  serverChildPriceCents: number;
  payments: "finished" | "open" | "none";
  taken: Set<string>;
};

async function addParticipants(
  tx: Tx,
  camp: CampCtx,
  families: FamilyPlan[],
  role: "camper" | "server",
  options: {
    teamId?: string;
    coordinatorFirst?: boolean;
    status?: () => (typeof schema.participantStatus.enumValues)[number];
  } = {},
) {
  const fresh = families.filter((family) => !camp.taken.has(family.id));
  if (fresh.length === 0) return;

  const participants: (typeof schema.campParticipants.$inferInsert)[] = [];
  const attendees: (typeof schema.campAttendees.$inferInsert)[] = [];
  fresh.forEach((family, index) => {
    camp.taken.add(family.id);
    const participantId = crypto.randomUUID();
    // Quem vai: membros ativos; filhos só se já tinham nascido, e alguns mais velhos ficam em casa.
    const going = family.people.filter((person) => {
      if (person.status !== "active") return false;
      if (person.role !== "child") return true;
      if (!person.birthDate || person.birthDate > camp.startDate) return false;
      const age = Number(camp.startDate.slice(0, 4)) - Number(person.birthDate.slice(0, 4));
      return !chance(age >= 14 ? 0.35 : 0.08);
    });
    // Às vezes só um dos cônjuges serve (ex.: música).
    const attending =
      role === "server" && options.teamId && !options.coordinatorFirst && chance(0.15)
        ? going.filter((person) => person.role !== "wife")
        : going;

    const prices =
      role === "camper"
        ? {
            startDate: camp.startDate,
            adultPriceCents: camp.adultPriceCents,
            childPriceCents: camp.childPriceCents,
          }
        : {
            startDate: camp.startDate,
            adultPriceCents: camp.serverAdultPriceCents,
            childPriceCents: camp.serverChildPriceCents,
          };
    const expected = expectedAmountCents(
      attending.map(
        (person) => ({ role: person.role, birthDate: person.birthDate ?? null }) as AttendeeForPricing,
      ),
      prices,
    );
    const status = options.status?.() ?? "confirmed";
    const roll = rand();
    const paidCents =
      status === "cancelled" || status === "waitlist" || camp.payments === "none"
        ? 0
        : camp.payments === "finished"
          ? roll < 0.8
            ? expected
            : roll < 0.92
              ? Math.round(expected / 2 / 100) * 100
              : 0
          : roll < 0.4
            ? expected
            : roll < 0.55
              ? Math.round(expected / 2 / 100) * 100
              : 0;

    participants.push({
      id: participantId,
      campId: camp.id,
      familyId: family.id,
      role,
      teamId: options.teamId ?? null,
      isCoordinator: !!options.coordinatorFirst && index === 0,
      status,
      paidCents,
      paymentMethod: paidCents > 0 ? (chance(0.7) ? "pix" : "cash") : null,
    });
    for (const person of attending) attendees.push({ participantId, personId: person.id });
  });

  await tx.insert(schema.campParticipants).values(participants);
  if (attendees.length) await tx.insert(schema.campAttendees).values(attendees);
}

/** Tendas e casais que podem servir: já passaram pela etapa do acampamento antes dele. */
function eligibleTents(tents: TentPlan[], camp: CampCtx, exclude: Set<string>) {
  return tents.filter((tent) => {
    if (exclude.has(tent.id) || tent.status !== "active") return false;
    const reached = tent.history.filter((entry) => entry.date < camp.startDate);
    const position = reached.length ? Math.max(...reached.map((entry) => entry.stageIndex)) : null;
    return canServe(position, camp.stageIndex);
  });
}

async function staffCamp(
  tx: Tx,
  camp: CampCtx,
  tents: TentPlan[],
  campers: Set<string>,
  families: Map<string, FamilyPlan>,
  teams: { tent: Team[]; special: Team[] },
) {
  const pool = shuffle(eligibleTents(tents, camp, campers));
  const tentTeams = shuffle(teams.tent).slice(0, Math.min(4, pool.length));
  for (const [i, team] of tentTeams.entries()) {
    const tent = pool[i];
    await tx
      .insert(schema.campTents)
      .values({ campId: camp.id, tentId: tent.id, role: "server", teamId: team.id });
    await addParticipants(
      tx,
      camp,
      tent.familyIds.map((id) => families.get(id)!),
      "server",
      {
        teamId: team.id,
        coordinatorFirst: true,
      },
    );
  }
  // Equipes especiais: casais avulsos das tendas que podem servir e ainda não estão no acampamento.
  const loose = shuffle(pool.slice(tentTeams.length).flatMap((tent) => tent.familyIds));
  for (const team of teams.special) {
    const chosen = loose.splice(0, int(2, 3)).map((id) => families.get(id)!);
    await addParticipants(tx, camp, chosen.slice(0, 1), "server", {
      teamId: team.id,
      coordinatorFirst: true,
    });
    await addParticipants(tx, camp, chosen.slice(1), "server", { teamId: team.id });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const stages: Stage[] = await db.query.stages.findMany({ orderBy: asc(schema.stages.position) });
  const allTeams: Team[] = await db.query.workTeams.findMany();
  const kerigma = stages.find((stage) => stage.formsTents);
  if (stages.length === 0 || !kerigma) {
    throw new Error("Cadastre as etapas antes (npm run db:seed) e marque a etapa em que nascem as tendas.");
  }
  if (stages.indexOf(kerigma) !== 0) throw new Error("A etapa em que nascem as tendas deve ser a primeira.");
  const existing = await db.select().from(schema.parishes).limit(1);
  if (existing.length > 0) {
    throw new Error(
      "Já existem paróquias cadastradas. Rode o clean-data antes para recriar os dados de demonstração.",
    );
  }
  const teams = {
    tent: allTeams.filter((team) => team.kind === "tent"),
    special: allTeams.filter((team) => team.kind === "special"),
  };

  const totals = { parishes: 0, tents: 0, families: 0, people: 0, camps: 0 };

  await db.transaction(async (tx) => {
    // 1. Paróquias
    const parishRows = await tx
      .insert(schema.parishes)
      .values(
        PARISHES.map((parish) => ({
          name: parish.name,
          city: "FRANCA",
          state: "SP",
          address: parish.address,
          zipCode: "14400-000",
          phone: phone(),
          email: emailOf("secretaria", parish.name.split(" ").at(-1)!),
          responsibleName: parish.responsible,
          responsiblePhone: phone(),
        })),
      )
      .returning({ id: schema.parishes.id, name: schema.parishes.name });
    totals.parishes = parishRows.length;
    const parishByName = new Map(parishRows.map((row) => [row.name, row.id]));

    // 2. Tendas e famílias, com o caminho calculado a partir do ano de formação.
    const tents: TentPlan[] = [];
    const families = new Map<string, FamilyPlan>();
    const namePool = shuffle([...TENT_NAMES]);
    for (const parish of PARISHES) {
      const parishId = parishByName.get(parish.name)!;
      const years = parish.years
        .map((offset) => thisYear + offset)
        .filter((year) => kerigmaDate(year) <= today);
      for (const [index, year] of years.sort((a, b) => a - b).entries()) {
        const formation = kerigmaDate(year);
        const all = stages.map((_, stageIndex) => ({
          stageIndex,
          date: stageIndex === 0 ? formation : addMonths(formation, stageOffset(stageIndex)),
        }));
        let history = all.filter((entry) => entry.date <= today);
        let status: TentPlan["status"] = "active";
        // Casos especiais para os pontos de atenção.
        if (parish.name === "SANTA GIANNA BERETTA MOLLA" && index === 2) history = history.slice(0, 4); // parada
        if (parish.name === "SÃO JOSÉ" && index === 0) {
          history = history.slice(0, 6);
          status = "inactive";
        }
        const next = status === "active" ? (all.find((entry) => entry.date > today) ?? null) : null;
        tents.push({
          id: crypto.randomUUID(),
          parishId,
          parishName: parish.name,
          number: index + 1,
          year,
          status,
          history,
          next: history.length === all.filter((e) => e.date <= today).length ? next : null,
          familyIds: [],
        });
      }
    }

    const familyPlans: FamilyPlan[] = [];
    for (const tent of tents) {
      const oldTent = thisYear - tent.year >= 3;
      for (let i = 0; i < int(7, 11); i++) {
        const plan = planFamily(tent.parishId, tent.id, tent.year, oldTent);
        tent.familyIds.push(plan.id);
        familyPlans.push(plan);
        families.set(plan.id, plan);
      }
    }

    const noGuardian = tents.filter((tent) => tent.parishName === "NOSSA SENHORA DA CONCEIÇÃO").at(-1)?.id;
    await tx.insert(schema.tents).values(
      tents.map((tent) => ({
        id: tent.id,
        parishId: tent.parishId,
        number: tent.number,
        name: chance(0.75) ? (namePool.pop() ?? null) : null,
        status: tent.status,
        currentStageId: stages[tent.history.at(-1)!.stageIndex].id,
        meetingSchedule: `${pick(["SEGUNDAS", "TERÇAS", "QUARTAS", "QUINTAS", "SEXTAS"])}, 20H`,
        meetingLocation: `CASA DE UMA DAS FAMÍLIAS (RODÍZIO)`,
        formedAt: addDays(kerigmaDate(tent.year), 2),
      })),
    );
    await tx.insert(schema.families).values(familyPlans.map(familyRow));
    await tx.insert(schema.people).values(familyPlans.flatMap((plan) => plan.people));
    for (const tent of tents) {
      if (tent.id === noGuardian) continue;
      await tx
        .update(schema.tents)
        .set({ guardianFamilyId: tent.familyIds[0] })
        .where(eq(schema.tents.id, tent.id));
    }
    totals.tents = tents.length;
    totals.families = familyPlans.length;
    totals.people = familyPlans.reduce((sum, plan) => sum + plan.people.length, 0);

    // 3. Acampamentos realizados: um por etapa com acampamento e data; Kerigma por pares de paróquias.
    const historyRows: (typeof schema.tentStageHistory.$inferInsert)[] = [];
    const campOf = new Map<string, string>(); // `${tentId}:${stageIndex}` -> campId

    const priceFor = (date: string) => (Number(date.slice(0, 4)) <= thisYear - 4 ? 11000 : 12500);
    async function createCamp(
      stageIndex: number,
      name: string,
      startDate: string,
      status: (typeof schema.campStatus.enumValues)[number],
      payments: CampCtx["payments"],
      expectedFamilies: number | null = null,
    ): Promise<CampCtx> {
      const adult = priceFor(startDate);
      const [row] = await tx
        .insert(schema.camps)
        .values({
          stageId: stages[stageIndex].id,
          name,
          startDate,
          endDate: addDays(startDate, 2),
          adultPriceCents: adult,
          childPriceCents: 2500,
          serverAdultPriceCents: adult - 2500,
          serverChildPriceCents: 2000,
          expectedFamilies,
          status,
        })
        .returning({ id: schema.camps.id });
      totals.camps += 1;
      return {
        id: row.id,
        stageIndex,
        startDate,
        adultPriceCents: adult,
        childPriceCents: 2500,
        serverAdultPriceCents: adult - 2500,
        serverChildPriceCents: 2000,
        payments,
        taken: new Set(),
      };
    }

    const familiesOf = (tent: TentPlan) => tent.familyIds.map((id) => families.get(id)!);

    // Kerigmas: no máximo uma tenda por paróquia e duas paróquias por acampamento.
    const byYear = new Map<number, TentPlan[]>();
    for (const tent of tents) byYear.set(tent.year, [...(byYear.get(tent.year) ?? []), tent]);
    for (const [year, yearTents] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
      const groups: TentPlan[][] = [];
      for (const tent of yearTents) {
        const group = groups.find((g) => g.length < 2 && !g.some((t) => t.parishId === tent.parishId));
        if (group) group.push(tent);
        else groups.push([tent]);
      }
      for (const [i, group] of groups.entries()) {
        const camp = await createCamp(
          0,
          `${kerigma.name} ${year}${groups.length > 1 ? ` – ${["I", "II", "III", "IV"][i]}` : ""}`,
          kerigmaDate(year),
          "finished",
          "finished",
          16 * group.length,
        );
        for (const tent of group) {
          await tx
            .insert(schema.campParishes)
            .values({ campId: camp.id, parishId: tent.parishId, formingTentId: tent.id });
          await addParticipants(tx, camp, familiesOf(tent), "camper");
          campOf.set(`${tent.id}:0`, camp.id);
        }
        await staffCamp(tx, camp, tents, new Set(group.map((t) => t.id)), families, teams);
      }
    }

    // Demais etapas com acampamento: agrupa as tendas pela data da etapa.
    const campStages = stages
      .map((stage, index) => ({ stage, index }))
      .filter((s) => s.stage.hasCamp && s.index > 0);
    for (const { stage, index } of campStages) {
      const byDate = new Map<string, TentPlan[]>();
      for (const tent of tents) {
        const entry = tent.history.find((h) => h.stageIndex === index);
        if (entry) byDate.set(entry.date, [...(byDate.get(entry.date) ?? []), tent]);
      }
      for (const [date, campers] of [...byDate.entries()].sort()) {
        const camp = await createCamp(
          index,
          `${stage.name} ${date.slice(0, 4)}`,
          date,
          "finished",
          "finished",
        );
        for (const tent of campers) {
          await tx.insert(schema.campTents).values({ campId: camp.id, tentId: tent.id, role: "camper" });
          await addParticipants(tx, camp, familiesOf(tent), "camper");
          campOf.set(`${tent.id}:${index}`, camp.id);
        }
        await staffCamp(tx, camp, tents, new Set(campers.map((t) => t.id)), families, teams);
      }
    }

    for (const tent of tents) {
      for (const entry of tent.history) {
        historyRows.push({
          tentId: tent.id,
          stageId: stages[entry.stageIndex].id,
          campId: campOf.get(`${tent.id}:${entry.stageIndex}`) ?? null,
          date: entry.date,
        });
      }
    }
    await tx.insert(schema.tentStageHistory).values(historyRows);

    // 4. Próximos acampamentos das tendas (próximos 13 meses).
    const horizon = addMonths(today, 13);
    const upcoming = new Map<string, TentPlan[]>();
    for (const tent of tents) {
      if (!tent.next || !stages[tent.next.stageIndex].hasCamp || tent.next.date > horizon) continue;
      const key = `${tent.next.stageIndex}|${tent.next.date}`;
      upcoming.set(key, [...(upcoming.get(key) ?? []), tent]);
    }
    const sortedUpcoming = [...upcoming.entries()].sort((a, b) =>
      a[0].split("|")[1].localeCompare(b[0].split("|")[1]),
    );
    for (const [i, [key, campers]] of sortedUpcoming.entries()) {
      const [stageIndex, date] = [Number(key.split("|")[0]), key.split("|")[1]];
      const open = i === 0;
      const camp = await createCamp(
        stageIndex,
        `${stages[stageIndex].name} ${date.slice(0, 4)}`,
        date,
        open ? "open" : "draft",
        open ? "open" : "none",
      );
      for (const tent of campers) {
        await tx.insert(schema.campTents).values({ campId: camp.id, tentId: tent.id, role: "camper" });
        await addParticipants(tx, camp, familiesOf(tent), "camper");
      }
      if (open) await staffCamp(tx, camp, tents, new Set(campers.map((t) => t.id)), families, teams);
    }

    // 5. Próximo Kerigma com inscrições abertas: duas paróquias formando tendas novas.
    const nextKerigmaYear = kerigmaDate(thisYear) > today ? thisYear : thisYear + 1;
    const kerigmaCamp = await createCamp(
      0,
      `${kerigma.name} ${nextKerigmaYear}`,
      kerigmaDate(nextKerigmaYear),
      "open",
      "open",
      32,
    );
    const statuses = [
      "confirmed",
      "confirmed",
      "confirmed",
      "confirmed",
      "confirmed",
      "confirmed",
      "pending",
      "waitlist",
      "cancelled",
    ] as const;
    for (const [parishName, count] of [
      ["NOSSA SENHORA DA CONCEIÇÃO", 14],
      ["SÃO SEBASTIÃO", 12],
    ] as const) {
      const parishId = parishByName.get(parishName)!;
      const number = tents.filter((tent) => tent.parishId === parishId).length + 1;
      const [forming] = await tx
        .insert(schema.tents)
        .values({ parishId, number, status: "forming", currentStageId: kerigma.id })
        .returning({ id: schema.tents.id });
      await tx
        .insert(schema.campParishes)
        .values({ campId: kerigmaCamp.id, parishId, formingTentId: forming.id });
      const registered = Array.from({ length: count }, () =>
        planFamily(parishId, forming.id, nextKerigmaYear, false),
      );
      await tx.insert(schema.families).values(registered.map(familyRow));
      await tx.insert(schema.people).values(registered.flatMap((plan) => plan.people));
      totals.families += registered.length;
      totals.people += registered.reduce((sum, plan) => sum + plan.people.length, 0);
      totals.tents += 1;
      await addParticipants(tx, kerigmaCamp, registered, "camper", { status: () => pick(statuses) });
    }
    await staffCamp(tx, kerigmaCamp, tents, new Set(), families, teams);
  });

  console.log(
    `Demonstração criada: ${totals.parishes} paróquias, ${totals.tents} tendas, ${totals.families} famílias, ` +
      `${totals.people} pessoas, ${totals.camps} acampamentos.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
