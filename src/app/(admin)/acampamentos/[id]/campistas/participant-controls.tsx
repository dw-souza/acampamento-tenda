"use client";

import { Baby } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { participantStatusLabels } from "@/lib/validation/camp";
import { setAttendance, setNanny, setParticipantStatus } from "../../participant-actions";

const statusItems = Object.entries(participantStatusLabels).map(([value, label]) => ({ value, label }));

function useAction() {
  const [pending, startTransition] = useTransition();
  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) toast.error(result.error);
    });
  }
  return { pending, run };
}

export function StatusSelect({ participantId, status }: { participantId: string; status: string }) {
  const { pending, run } = useAction();
  return (
    <Select
      items={statusItems}
      value={status}
      onValueChange={(value) => value && run(() => setParticipantStatus(participantId, value))}
      disabled={pending}
    >
      <SelectTrigger size="sm" className="w-40" aria-label="Situação da inscrição">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export type MemberOption = {
  id: string;
  label: string;
  detail?: string;
  attending: boolean;
};

export function AttendanceChecks({
  participantId,
  members,
}: {
  participantId: string;
  members: MemberOption[];
}) {
  const { pending, run } = useAction();
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {members.map((member) => {
        const id = `${participantId}-${member.id}`;
        return (
          <label key={member.id} htmlFor={id} className="flex items-center gap-1.5 text-sm">
            <Checkbox
              id={id}
              checked={member.attending}
              disabled={pending}
              onCheckedChange={(checked) => run(() => setAttendance(participantId, member.id, checked))}
            />
            <span className={member.attending ? undefined : "text-muted-foreground line-through"}>
              {member.label}
            </span>
            {member.detail && <span className="text-xs text-muted-foreground">{member.detail}</span>}
          </label>
        );
      })}
    </div>
  );
}

/** Babá (pajem) de quem leva criança com menos de 3 anos: se vai e quem é. */
export function NannyControl({
  participantId,
  status,
  name,
}: {
  participantId: string;
  status: "pending" | "going" | "not_going";
  name: string | null;
}) {
  const { pending, run } = useAction();
  const [editing, setEditing] = useState(status === "pending");
  const [askingName, setAskingName] = useState(false);
  const [value, setValue] = useState(name ?? "");

  function save(going: boolean) {
    run(async () => {
      const result = await setNanny(participantId, going, value);
      if (!result?.error) {
        setEditing(false);
        setAskingName(false);
      }
      return result;
    });
  }

  if (!editing) {
    return (
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <Baby className="size-3.5 text-muted-foreground" aria-hidden />
        <span>{status === "going" ? `Babá: ${name}` : "Sem babá"}</span>
        <Button
          type="button"
          variant="link"
          size="xs"
          className="h-auto p-0"
          onClick={() => setEditing(true)}
        >
          Alterar
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
      <StatusBadge tone="warning">
        <Baby className="size-3" aria-hidden /> {status === "pending" ? "Informar babá" : "Babá"}
      </StatusBadge>
      {askingName ? (
        <form
          className="flex items-center gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            save(true);
          }}
        >
          <Input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Nome da babá"
            aria-label="Nome da babá"
            className="h-7 w-48 uppercase"
          />
          <Button type="submit" size="xs" disabled={pending || !value.trim()}>
            Salvar
          </Button>
          <Button type="button" variant="ghost" size="xs" onClick={() => setAskingName(false)}>
            Voltar
          </Button>
        </form>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={pending}
            onClick={() => setAskingName(true)}
          >
            Vai
          </Button>
          <Button type="button" variant="outline" size="xs" disabled={pending} onClick={() => save(false)}>
            Não vai
          </Button>
          {status !== "pending" && (
            <Button type="button" variant="ghost" size="xs" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          )}
        </>
      )}
    </div>
  );
}
