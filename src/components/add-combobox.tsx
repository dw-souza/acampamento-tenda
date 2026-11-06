"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { ActionResult } from "@/lib/action-result";

type Option = { value: string; label: string };

/** Busca + botão "Adicionar" que chama uma Server Action com o valor escolhido. */
export function AddCombobox({
  options,
  action,
  placeholder,
  emptyText = "Nada encontrado.",
}: {
  options: Option[];
  action: (value: string) => Promise<ActionResult>;
  placeholder: string;
  emptyText?: string;
}) {
  const [selected, setSelected] = useState<Option | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    if (!selected) return;
    startTransition(async () => {
      const result = await action(selected.value);
      if (result?.error) return void toast.error(result.error);
      if (result?.warning) toast.warning(result.warning);
      setSelected(null);
    });
  }

  return (
    <div className="flex gap-2">
      <Combobox
        items={options}
        value={selected}
        onValueChange={setSelected}
        itemToStringLabel={(option: Option) => option.label}
        isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
      >
        <ComboboxInput placeholder={placeholder} aria-label={placeholder} className="min-w-64 flex-1" />
        <ComboboxContent>
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
          <ComboboxList>
            {(option: Option) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Button variant="outline" onClick={handleAdd} disabled={!selected || pending}>
        Adicionar
      </Button>
    </div>
  );
}
