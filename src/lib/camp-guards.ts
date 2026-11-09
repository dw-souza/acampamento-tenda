import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { camps } from "@/db/schema";

/**
 * Acampamento ainda agendado, para ações que mudam a estrutura (tendas, equipes, inscrições).
 * Depois de concluído, só "quem vai" e pagamentos continuam editáveis.
 */
export async function scheduledCamp(campId: string) {
  const camp = await db.query.camps.findFirst({ where: eq(camps.id, campId), with: { stage: true } });
  if (!camp) return { ok: false, error: "Acampamento não encontrado." } as const;
  if (camp.status !== "scheduled") {
    return { ok: false, error: "O acampamento já foi concluído. Desfaça a conclusão para alterar." } as const;
  }
  return { ok: true, camp } as const;
}
