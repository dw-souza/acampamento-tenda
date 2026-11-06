// Cria um usuário da secretaria (o app não tem cadastro público).
// Uso: npm run user:create -- "Nome" email@exemplo.com senha
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

async function main() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error('Uso: npm run user:create -- "Nome" email senha');
    process.exit(1);
  }

  // Instância própria com cadastro habilitado; a do app tem disableSignUp.
  const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: { enabled: true },
  });

  await auth.api.signUpEmail({ body: { name, email, password } });
  console.log(`Usuário criado: ${email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
