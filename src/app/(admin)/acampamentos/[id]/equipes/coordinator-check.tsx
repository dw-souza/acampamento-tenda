"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { setCoordinator } from "../../team-actions";

export function CoordinatorCheck({ participantId, checked }: { participantId: string; checked: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Checkbox
      aria-label="Coordenador"
      checked={checked}
      disabled={pending}
      onCheckedChange={(value) =>
        startTransition(async () => {
          const result = await setCoordinator(participantId, value);
          if (result?.error) toast.error(result.error);
        })
      }
    />
  );
}
