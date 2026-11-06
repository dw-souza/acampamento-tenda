// Tesouraria: o pagamento é um pedido, nunca uma condição para acampar ou servir.

export type PaymentStatus = "free" | "unpaid" | "partial" | "paid";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  free: "Sem valor",
  unpaid: "Não pagou",
  partial: "Parcial",
  paid: "Pago",
};

export function paymentStatus(expectedCents: number, paidCents: number): PaymentStatus {
  if (paidCents >= expectedCents) return expectedCents === 0 && paidCents === 0 ? "free" : "paid";
  return paidCents === 0 ? "unpaid" : "partial";
}

export type PaymentEntry = {
  role: "camper" | "server";
  method: "pix" | "cash" | null;
  expectedCents: number;
  paidCents: number;
};

export function treasuryTotals(entries: PaymentEntry[]) {
  const totals = {
    expectedCents: 0,
    paidCents: 0,
    byRole: { camper: { expectedCents: 0, paidCents: 0 }, server: { expectedCents: 0, paidCents: 0 } },
    byMethod: { pix: 0, cash: 0 },
    /** Quanto ainda falta receber (pagamentos acima do esperado não abatem de outras famílias). */
    missingCents: 0,
  };
  for (const entry of entries) {
    totals.expectedCents += entry.expectedCents;
    totals.paidCents += entry.paidCents;
    totals.byRole[entry.role].expectedCents += entry.expectedCents;
    totals.byRole[entry.role].paidCents += entry.paidCents;
    if (entry.method) totals.byMethod[entry.method] += entry.paidCents;
    totals.missingCents += Math.max(0, entry.expectedCents - entry.paidCents);
  }
  return totals;
}
