import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Localmente vale só o .env.local: o drizzle-kit carrega o .env sozinho, e ele pode apontar
// para o Neon. Na Vercel não há .env.local e valem as variáveis do projeto.
const env = existsSync(".env.local") ? parse(readFileSync(".env.local")) : process.env;

export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations usam a conexão direta (sem pooler) quando existir, como recomenda o Neon.
  dbCredentials: { url: env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL! },
  casing: "snake_case",
});
