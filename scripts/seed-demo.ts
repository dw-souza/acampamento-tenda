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

// Meses (mín., máx.) entre uma etapa e a anterior, pela posição. Não há temporada fixa: há
// vários acampamentos de cada etapa por ano, e cada grupo de tendas acampa num sábado qualquer.
const GAPS: [number, number][] = [
  [0, 0], // Kerigma (formação)
  [6, 9], // Tabor
  [3, 5], // Ventania
  [4, 6], // Chai
  [5, 7], // Anawin
  [4, 6], // Kenosis
  [4, 6], // Caminho de Emaús
  [8, 12], // Koinonia
  [6, 8], // Consagração
];
const gapAfter = (index: number) => GAPS[index] ?? [6, 8];

function nextSaturday(isoDate: string) {
  let date = isoDate;
  while (new Date(`${date}T12:00:00Z`).getUTCDay() !== 6) date = addDays(date, 1);
  return date;
}

// Tendas cuja data prevista para a etapa cai em até 60 dias acampam juntos.
const GROUP_WINDOW_DAYS = 60;
const daysBetween = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86_400_000;

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

// Anos de formação dos tendas (relativos ao ano atual).
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
  /** Etapas (índice) e datas em que o tenda passou, até hoje. */
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

  // Raros: viuvez e separação (a família continua no tenda).
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
  // Equipes especiais: casais avulsos dos tendas que podem servir e ainda não estão no acampamento.
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
    throw new Error("Cadastre as etapas antes (npm run db:seed) e marque a etapa em que nascem os tendas.");
  }
  if (stages.indexOf(kerigma) !== 0) throw new Error("A etapa em que nascem os tendas deve ser a primeira.");
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

    // 2. Tendas e famílias. Cada tenda nasce num Kerigma do seu ano e segue o caminho com
    //    intervalos variáveis entre as etapas.
    const tents: TentPlan[] = [];
    const families = new Map<string, FamilyPlan>();
    const formationTarget = new Map<string, string>();
    for (const parish of PARISHES) {
      const parishId = parishByName.get(parish.name)!;
      const years = parish.years.map((offset) => thisYear + offset);
      for (const [index, year] of years.sort((a, b) => a - b).entries()) {
        const latest = year === thisYear ? addDays(today, -45) : `${year}-11-30`;
        const id = crypto.randomUUID();
        formationTarget.set(id, randomDate(`${year}-01-15`, latest));
        tents.push({
          id,
          parishId,
          parishName: parish.name,
          number: index + 1,
          year,
          status: "active",
          history: [],
          next: null,
          familyIds: [],
        });
      }
    }

    // Datas, etapa por etapa: a data prevista é a etapa anterior + um intervalo; tendas com
    // previsões próximas viram um acampamento no sábado seguinte à última previsão do grupo.
    // Kerigma: no máximo duas paróquias, um tenda novo por paróquia. Demais: até três tendas.
    type Group = { stageIndex: number; date: string; tents: TentPlan[] };
    const groups: Group[] = [];
    const dateOf = new Map<string, string>(); // `${tentId}:${stageIndex}` -> data
    stages.forEach((stage, stageIndex) => {
      const [min, max] = gapAfter(stageIndex);
      const target = (tent: TentPlan) =>
        stageIndex === 0
          ? formationTarget.get(tent.id)!
          : addDays(dateOf.get(`${tent.id}:${stageIndex - 1}`)!, int(min * 30, max * 30));
      const planned = tents
        .map((tent) => ({ tent, date: target(tent) }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (!stage.hasCamp) {
        for (const { tent, date } of planned) dateOf.set(`${tent.id}:${stageIndex}`, date);
        return;
      }
      let current: typeof planned = [];
      const flush = () => {
        if (current.length === 0) return;
        const date = nextSaturday(current.at(-1)!.date);
        groups.push({ stageIndex, date, tents: current.map((item) => item.tent) });
        for (const item of current) dateOf.set(`${item.tent.id}:${stageIndex}`, date);
        current = [];
      };
      for (const item of planned) {
        const fits =
          current.length > 0 &&
          current.length < (stageIndex === 0 ? 2 : 3) &&
          daysBetween(current[0].date, item.date) <= GROUP_WINDOW_DAYS &&
          !(stageIndex === 0 && current.some((other) => other.tent.parishId === item.tent.parishId));
        if (!fits) flush();
        current.push(item);
      }
      flush();
    });

    for (const tent of tents) {
      const all = stages.map((_, stageIndex) => ({
        stageIndex,
        date: dateOf.get(`${tent.id}:${stageIndex}`)!,
      }));
      tent.history = all.filter((entry) => entry.date <= today);
      tent.next = all.find((entry) => entry.date > today) ?? null;
      // Casos especiais para os pontos de atenção.
      const index = tents.filter((t) => t.parishId === tent.parishId).indexOf(tent);
      if (tent.parishName === "SANTA GIANNA BERETTA MOLLA" && index === 2) {
        tent.history = tent.history.slice(0, 4); // parado
        tent.next = null;
      }
      if (tent.parishName === "SÃO JOSÉ" && index === 0) {
        tent.history = tent.history.slice(0, 6);
        tent.status = "inactive";
        tent.next = null;
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
        status: tent.status,
        currentStageId: stages[tent.history.at(-1)!.stageIndex].id,
        meetingSchedule: `${pick(["SEGUNDAS", "TERÇAS", "QUARTAS", "QUINTAS", "SEXTAS"])}, 20H`,
        meetingLocation: `CASA DE UMA DAS FAMÍLIAS (RODÍZIO)`,
        formedAt: addDays(tent.history[0].date, 2),
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

    // 3. Acampamentos: realizados (até hoje) e próximos (próximos 13 meses).
    const campOf = new Map<string, string>(); // `${tentId}:${stageIndex}` -> campId
    const priceFor = (date: string) => (Number(date.slice(0, 4)) <= thisYear - 4 ? 11000 : 12500);
    async function createCamp(
      stageIndex: number,
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

    const horizon = addMonths(today, 13);
    const openUntil = addDays(today, 75);
    let openedOne = false;
    for (const group of groups.sort((a, b) => a.date.localeCompare(b.date))) {
      const past = group.date <= today;
      // Só entram os tendas que de fato chegam a essa etapa (parados e inativos ficam fora).
      const campers = group.tents.filter((tent) =>
        past
          ? tent.history.some((entry) => entry.stageIndex === group.stageIndex)
          : tent.next?.stageIndex === group.stageIndex,
      );
      if (campers.length === 0 || (!past && group.date > horizon)) continue;

      // Próximos: o mais perto (ou até 75 dias) já tem equipes e pagamentos em andamento.
      const open = !past && (group.date <= openUntil || !openedOne);
      if (open) openedOne = true;
      const camp = await createCamp(
        group.stageIndex,
        group.date,
        past ? "finished" : "scheduled",
        past ? "finished" : open ? "open" : "none",
        group.stageIndex === 0 ? 16 * campers.length : null,
      );
      for (const tent of campers) {
        if (group.stageIndex === 0) {
          await tx
            .insert(schema.campParishes)
            .values({ campId: camp.id, parishId: tent.parishId, formingTentId: tent.id });
        } else {
          await tx.insert(schema.campTents).values({ campId: camp.id, tentId: tent.id, role: "camper" });
        }
        await addParticipants(tx, camp, familiesOf(tent), "camper");
        if (past) campOf.set(`${tent.id}:${group.stageIndex}`, camp.id);
      }
      if (past || open) await staffCamp(tx, camp, tents, new Set(campers.map((t) => t.id)), families, teams);
    }

    await tx.insert(schema.tentStageHistory).values(
      tents.flatMap((tent) =>
        tent.history.map((entry) => ({
          tentId: tent.id,
          stageId: stages[entry.stageIndex].id,
          campId: campOf.get(`${tent.id}:${entry.stageIndex}`) ?? null,
          date: entry.date,
        })),
      ),
    );

    // 4. Próximos Kerigmas: um com inscrições abertas (duas paróquias formando tendas novos) e
    //    outro ainda em preparação.
    const openDate = nextSaturday(addDays(today, int(25, 45)));
    const laterDate = nextSaturday(addDays(today, int(70, 100)));
    const kerigmaYear = Number(openDate.slice(0, 4));
    const statuses = [
      "confirmed",
      "confirmed",
      "confirmed",
      "confirmed",
      "confirmed",
      "confirmed",
      "waitlist",
      "cancelled",
    ] as const;
    const nextKerigmas = [
      {
        date: openDate,
        inProgress: true,
        parishes: [
          ["NOSSA SENHORA DA CONCEIÇÃO", 14],
          ["SÃO SEBASTIÃO", 12],
        ] as const,
      },
      {
        date: laterDate,
        inProgress: false,
        parishes: [
          ["SANTA GIANNA BERETTA MOLLA", 0],
          ["SÃO JOSÉ", 0],
        ] as const,
      },
    ];
    for (const next of nextKerigmas) {
      const camp = await createCamp(0, next.date, "scheduled", next.inProgress ? "open" : "none", 32);
      for (const [parishName, count] of next.parishes) {
        const parishId = parishByName.get(parishName)!;
        const number = tents.filter((tent) => tent.parishId === parishId).length + 1;
        const [forming] = await tx
          .insert(schema.tents)
          .values({ parishId, number, status: "forming", currentStageId: kerigma.id })
          .returning({ id: schema.tents.id });
        await tx.insert(schema.campParishes).values({ campId: camp.id, parishId, formingTentId: forming.id });
        totals.tents += 1;
        if (count === 0) continue;
        const registered = Array.from({ length: count }, () =>
          planFamily(parishId, forming.id, kerigmaYear, false),
        );
        await tx.insert(schema.families).values(registered.map(familyRow));
        await tx.insert(schema.people).values(registered.flatMap((plan) => plan.people));
        totals.families += registered.length;
        totals.people += registered.reduce((sum, plan) => sum + plan.people.length, 0);
        await addParticipants(tx, camp, registered, "camper", { status: () => pick(statuses) });
      }
      if (next.inProgress) await staffCamp(tx, camp, tents, new Set(), families, teams);
    }
  });

  console.log(
    `Demonstração criada: ${totals.parishes} paróquias, ${totals.tents} tendas, ${totals.families} famílias, ` +
      `${totals.people} pessoas, ${totals.camps} acampamentos.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  if (error instanceof Error && error.cause)
    console.error("Causa:", (error.cause as Error).message ?? error.cause);
  process.exit(1);
});
