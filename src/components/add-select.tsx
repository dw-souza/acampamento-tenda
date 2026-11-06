"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";

/** Select + botão "Adicionar" que chama uma Server Action com o valor escolhido. */
export function AddSelect({
  options,
  action,
  placeholder,
  label = "Adicionar",
}: {
  options: { value: string; label: string }[];
  action: (value: string) => Promise<ActionResult>;
  placeholder: string;
  label?: string;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    if (!value) return;
    startTransition(async () => {
      const result = await action(value);
      if (result?.error) return void toast.error(result.error);
      if (result?.warning) toast.warning(result.warning);
      setValue(null);
    });
  }

  if (options.length === 0) return null;

  return (
    <div className="flex gap-2">
      <Select items={options} value={value} onValueChange={setValue}>
        <SelectTrigger className="min-w-56 flex-1" aria-label={placeholder}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={handleAdd} disabled={!value || pending}>
        {label}
      </Button>
    </div>
  );
}
