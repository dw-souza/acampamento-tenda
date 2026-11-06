import "server-only";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const authOptions = {
  database: drizzleAdapter(db, { provider: "pg", schema }),
  // Sem cadastro público: usuários são criados pelo script `npm run user:create`.
  emailAndPassword: { enabled: true, disableSignUp: true },
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "admin" },
    },
  },
  plugins: [nextCookies()],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);
