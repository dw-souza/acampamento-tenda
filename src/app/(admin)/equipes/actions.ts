"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { workTeams } from "@/db/schema";
import { type ActionResult, dbErrorMessage, parseOrError } from "@/lib/action-result";
import { requireUser } from "@/lib/dal";
import { type WorkTeamInput, workTeamSchema } from "@/lib/validation/work-team";

export async function saveWorkTeam(id: string | null, input: WorkTeamInput): Promise<ActionResult> {
  await requireUser();
  const parsed = parseOrError(workTeamSchema, input);
  if (!parsed.ok) return { error: parsed.error };

  try {
    if (id) await db.update(workTeams).set(parsed.data).where(eq(workTeams.id, id));
    else await db.insert(workTeams).values(parsed.data);
  } catch (error) {
    return { error: dbErrorMessage(error, { unique: "Já existe uma equipe com esse nome." }) };
  }
  revalidatePath("/equipes");
  redirect("/equipes");
}

export async function deleteWorkTeam(id: string): Promise<ActionResult> {
  await requireUser();
  try {
    await db.delete(workTeams).where(eq(workTeams.id, id));
  } catch (error) {
    return { error: dbErrorMessage(error, { inUse: "A equipe já foi usada em algum acampamento." }) };
  }
  revalidatePath("/equipes");
}
