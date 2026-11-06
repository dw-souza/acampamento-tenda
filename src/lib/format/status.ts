// Tom de cor de cada situação, usado pelo StatusBadge.
import type { Tone } from "@/components/status-badge";

export const campStatusTone: Record<"draft" | "open" | "closed" | "finished", Tone> = {
  draft: "neutral",
  open: "success",
  closed: "warning",
  finished: "info",
};

export const participantStatusTone: Record<"pending" | "confirmed" | "waitlist" | "cancelled", Tone> = {
  pending: "warning",
  confirmed: "success",
  waitlist: "info",
  cancelled: "danger",
};

// Pagamento é um pedido: "não pagou" é neutro, não erro.
export const paymentStatusTone: Record<"free" | "unpaid" | "partial" | "paid", Tone> = {
  free: "neutral",
  unpaid: "neutral",
  partial: "warning",
  paid: "success",
};

export const tentStatusTone: Record<"forming" | "active" | "inactive", Tone> = {
  forming: "info",
  active: "success",
  inactive: "neutral",
};
