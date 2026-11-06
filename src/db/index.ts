import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Reaproveita o pool entre hot reloads do `next dev`.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool = globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;
// Na Vercel (Fluid compute), fecha conexões ociosas antes de a instância ser suspensa.
attachDatabasePool(pool);

export const db = drizzle(pool, { schema, casing: "snake_case" });
export type Db = typeof db;
