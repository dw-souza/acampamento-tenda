import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workTeams } from "@/db/schema";
import { requireUser } from "@/lib/dal";

export async function listWorkTeams() {
  await requireUser();
  return db.query.workTeams.findMany({ orderBy: [asc(workTeams.kind), asc(workTeams.name)] });
}

export async function getWorkTeam(id: string) {
  await requireUser();
  return db.query.workTeams.findFirst({ where: eq(workTeams.id, id) });
}
