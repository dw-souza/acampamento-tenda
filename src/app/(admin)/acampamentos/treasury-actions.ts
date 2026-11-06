"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { campParticipants } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/dal";
import { parseMoney } from "@/lib/format/money";

export async function setPayment(
  participantId: string,
  paid: string,
  method: string | null,
): Promise<ActionResult> {
  await requireUser();
  const paidCents = parseMoney(paid === "" ? "0" : paid);
  if (paidCents === null) return { error: "Valor inválido (ex.: 250,00)." };
  if (method !== null && method !== "pix" && method !== "cash")
    return { error: "Forma de pagamento inválida." };
  if (paidCents > 0 && !method) return { error: "Informe se foi PIX ou dinheiro." };

  const [row] = await db
    .update(campParticipants)
    .set({ paidCents, paymentMethod: paidCents > 0 ? method : null })
    .where(eq(campParticipants.id, participantId))
    .returning({ campId: campParticipants.campId });
  if (row) revalidatePath(`/acampamentos/${row.campId}`, "layout");
  return undefined;
}
