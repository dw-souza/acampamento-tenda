import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { parishes } from "@/db/schema";
import { requireUser } from "@/lib/dal";

export async function listParishes() {
  await requireUser();
  return db.query.parishes.findMany({ orderBy: asc(parishes.name) });
}

export async function getParish(id: string) {
  await requireUser();
  return db.query.parishes.findFirst({ where: eq(parishes.id, id) });
}

export async function parishOptions() {
  await requireUser();
  const rows = await db
    .select({ value: parishes.id, label: parishes.name })
    .from(parishes)
    .where(eq(parishes.active, true))
    .orderBy(asc(parishes.name));
  return rows;
}
