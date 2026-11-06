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
  { name: "Cozinha", kind: "tent", color: "#EF4444", description: "Preparação das refeições" },
  { name: "Secretaria", kind: "tent", color: "#3B82F6", description: "Organização, inscrições, tesouraria e crachás" },
  { name: "Capela", kind: "tent", color: "#8B5CF6", description: "Liturgia e momentos espirituais" },
  { name: "Filhos", kind: "tent", color: "#10B981", description: "Cuidado e atividades das crianças" },
  { name: "Limpeza", kind: "tent", color: "#F59E0B", description: "Limpeza e organização dos espaços" },
  { name: "Segurança", kind: "tent", color: "#6B7280", description: "Segurança e controle de acesso" },
  { name: "Som e Mídia", kind: "tent", color: "#EC4899", description: "Som e apresentações" },
  { name: "Logística", kind: "tent", color: "#6366F1", description: "Transporte e organização geral" },
  { name: "Música", kind: "special", color: "#14B8A6", description: "Músicos de várias tendas" },
  { name: "Ensino", kind: "special", color: "#A855F7", description: "Casais que fazem os ensinos" },
  { name: "Confidentes", kind: "special", color: "#22C55E", description: "Acompanhamento espiritual" },
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
