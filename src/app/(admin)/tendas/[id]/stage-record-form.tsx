"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordTentStage } from "../actions";

export function StageRecordForm({
  tentId,
  stageOptions,
}: {
  tentId: string;
  stageOptions: { value: string; label: string }[];
}) {
  const [stageId, setStageId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await recordTentStage(tentId, stageId ?? "", date);
      if (result?.error) return void toast.error(result.error);
      setStageId(null);
      setDate("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t pt-4">
      <p className="text-xs text-muted-foreground">Registrar etapa sem acampamento</p>
      <Select items={stageOptions} value={stageId} onValueChange={setStageId}>
        <SelectTrigger className="w-full" aria-label="Etapa">
          <SelectValue placeholder="Etapa" />
        </SelectTrigger>
        <SelectContent>
          {stageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Data" />
        <Button type="submit" variant="outline" disabled={pending || !stageId || !date}>
          Registrar
        </Button>
      </div>
    </form>
  );
}
