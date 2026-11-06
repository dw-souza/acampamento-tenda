"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { centsToInput } from "@/lib/format/money";
import { setPayment } from "../../treasury-actions";

const methods = [
  { value: "pix", label: "PIX" },
  { value: "cash", label: "Dinheiro" },
];

export function PaymentEditor({
  participantId,
  paidCents,
  method,
  expectedCents,
}: {
  participantId: string;
  paidCents: number;
  method: "pix" | "cash" | null;
  expectedCents: number;
}) {
  const initialPaid = paidCents > 0 ? centsToInput(paidCents) : "";
  const [paid, setPaid] = useState(initialPaid);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(method);
  const [pending, startTransition] = useTransition();
  const dirty = paid !== initialPaid || paymentMethod !== method;

  function save(event?: React.FormEvent) {
    event?.preventDefault();
    startTransition(async () => {
      const result = await setPayment(participantId, paid.trim(), paymentMethod);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <form onSubmit={save} className="flex items-center justify-end gap-2">
      {expectedCents > paidCents && (
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={() => setPaid(centsToInput(expectedCents))}
          title="Preencher com o valor esperado"
        >
          Quitar
        </Button>
      )}
      <Input
        value={paid}
        onChange={(event) => setPaid(event.target.value)}
        inputMode="decimal"
        placeholder="0,00"
        aria-label="Valor pago"
        className="h-7 w-24 text-right tabular-nums"
      />
      <Select items={methods} value={paymentMethod} onValueChange={setPaymentMethod}>
        <SelectTrigger size="sm" className="w-28" aria-label="Forma de pagamento">
          <SelectValue placeholder="Forma" />
        </SelectTrigger>
        <SelectContent>
          {methods.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={!dirty || pending}>
        Salvar
      </Button>
    </form>
  );
}
