import { Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFamily, getFamilyHistory } from "@/lib/data/families";
import { parishOptions } from "@/lib/data/parishes";
import { tentOptions } from "@/lib/data/tents";
import { coupleName, formatDate, plural, tentLabel } from "@/lib/format/labels";
import { participantStatusLabels } from "@/lib/validation/camp";
import { deleteFamily, saveFamily } from "../actions";
import { FamilyForm } from "../family-form";
import { familyValues } from "../form-values";
import { StatusBadge } from "@/components/status-badge";
import { participantStatusTone } from "@/lib/format/status";

export default async function FamilyPage({ params }: PageProps<"/familias/[id]">) {
  const { id } = await params;
  const [family, parishes, tents, history] = await Promise.all([
    getFamily(id),
    parishOptions(),
    tentOptions(),
    getFamilyHistory(id),
  ]);
  if (!family) notFound();

  const name = coupleName(family.people);
  return (
    <>
      <PageHeader
        icon={Users}
        title={name}
        description={[family.parish.name, family.tent && tentLabel(family.tent)].filter(Boolean).join(" · ")}
        actions={
          <DeleteButton
            action={deleteFamily.bind(null, family.id)}
            title={`Remover ${name}?`}
            description="Remove a família, os filhos e as participações em acampamentos. Para quem deixou a tenda, prefira marcar a situação como “Saiu”."
          />
        }
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,1fr)]">
        <FamilyForm
          action={saveFamily.bind(null, family.id)}
          cancelHref="/familias"
          parishOptions={parishes}
          tentOptions={tents}
          defaultValues={familyValues(family)}
        />
        <Card className="h-fit lg:sticky lg:top-4" size="sm">
          <CardHeader>
            <CardTitle>Acampamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum acampamento ainda.</p>
            ) : (
              <ul className="flex flex-col gap-3 text-sm">
                {history.map((entry) => (
                  <li key={entry.id}>
                    <Link href={`/acampamentos/${entry.campId}`} className="font-medium hover:underline">
                      {entry.camp.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {entry.role === "camper" ? "Campista" : (entry.team?.name ?? "Servo")}
                      {entry.isCoordinator && " · coordenador"} · {formatDate(entry.camp.startDate)} ·{" "}
                      {plural(entry.attendees.length, "pessoa", "pessoas")}
                    </p>
                    {entry.status !== "confirmed" && (
                      <StatusBadge tone={participantStatusTone[entry.status]} className="mt-1">
                        {participantStatusLabels[entry.status]}
                      </StatusBadge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
