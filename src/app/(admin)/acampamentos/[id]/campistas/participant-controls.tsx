"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { participantStatusLabels } from "@/lib/validation/camp";
import { setAttendance, setParticipantStatus } from "../../participant-actions";

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

export function AttendanceChecks({ participantId, members }: { participantId: string; members: MemberOption[] }) {
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
