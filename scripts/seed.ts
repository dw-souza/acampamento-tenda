// Dados de referência. Idempotente: pode rodar várias vezes.
// Uso: npm run db:seed
import { db } from "@/db";
import { stages, workTeams } from "@/db/schema";

const stageSeed = [
  { name: "Kerigma", hasCamp: true, formsTents: true },
  { name: "Tabor", hasCamp: true },
  { name: "Ventania", hasCamp: false },
  { name: "Chai", hasCamp: false },
  { name: "Anawin", hasCamp: true },
  { name: "Kenosis", hasCamp: false },
  { name: "Caminho de Emaús", hasCamp: false },
  { name: "Koinonia", hasCamp: true },
  { name: "Consagração", hasCamp: false },
].map((stage, i) => ({ ...stage, name: stage.name.toUpperCase(), position: i + 1 }));

const teamSeed = [
  { name: "Capela", kind: "tent", color: "#8B5CF6", description: "Liturgia e momentos espirituais" },
  { name: "Cozinha", kind: "tent", color: "#EF4444", description: "Preparação das refeições" },
  { name: "Filhos", kind: "tent", color: "#10B981", description: "Cuidado e atividades das crianças" },
  {
    name: "Secretaria",
    kind: "tent",
    color: "#3B82F6",
    description: "Organização, inscrições, tesouraria e crachás",
  },
  { name: "Confidentes", kind: "special", color: "#22C55E", description: "Acompanhamento espiritual" },
  {
    name: "Coordenadores gerais",
    kind: "special",
    color: "#F4F73B",
    description: "Coordenadores do acampamento no geral.",
    highlight: true,
  },
  { name: "Ensino", kind: "special", color: "#A855F7", description: "Casais que fazem os ensinos" },
  {
    name: "Formadores",
    kind: "special",
    color: "#AC3BF7",
    description: "Formadores das equipes de trabalho",
    highlight: true,
  },
  { name: "Música", kind: "special", color: "#14B8A6", description: "Músicos de vários tendas" },
] as const;

async function main() {
  await db.insert(stages).values(stageSeed).onConflictDoNothing();
  await db
    .insert(workTeams)
    .values(teamSeed.map((team) => ({ ...team, name: team.name.toUpperCase() })))
    .onConflictDoNothing();
  console.log(`Etapas: ${stageSeed.length}, equipes: ${teamSeed.length}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
