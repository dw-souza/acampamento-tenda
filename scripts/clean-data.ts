// Apaga os cadastros (paróquias, tendas, famílias, pessoas e acampamentos).
// Mantém etapas, equipes e usuários. Irreversível: exige --yes.
// Uso: npm run db:clean -- --yes   |   npm run prod:clean -- --yes
import { sql } from "drizzle-orm";
import { db } from "@/db";

async function main() {
  if (!process.argv.includes("--yes")) {
    console.error(
      "Isto apaga todas as paróquias, tendas, famílias e acampamentos. Rode com --yes para confirmar.",
    );
    process.exit(1);
  }
  const host = new URL(process.env.DATABASE_URL!).hostname;
  // TRUNCATE ... CASCADE leva junto tudo que depende dessas tabelas (tendas, famílias, inscrições...).
  await db.execute(sql`truncate table parishes, camps restart identity cascade`);
  console.log(`Cadastros apagados em ${host}. Etapas, equipes e usuários foram mantidos.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
