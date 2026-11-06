import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { stages } from "@/db/schema";
import { requireUser } from "@/lib/dal";

export async function listStages() {
  await requireUser();
  return db.query.stages.findMany({ orderBy: asc(stages.position) });
}

export async function getStage(id: string) {
  await requireUser();
  return db.query.stages.findFirst({ where: eq(stages.id, id) });
}

export async function stageOptions() {
  const rows = await listStages();
  return rows.map((stage) => ({ value: stage.id, label: stage.name }));
}
