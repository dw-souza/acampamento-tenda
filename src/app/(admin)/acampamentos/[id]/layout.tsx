import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCamp } from "@/lib/data/camps";
import { formatDate } from "@/lib/format/labels";
import { campStatusLabels } from "@/lib/validation/camp";
import { CampTabs } from "./camp-tabs";

export default async function CampLayout({ children, params }: LayoutProps<"/acampamentos/[id]">) {
  const { id } = await params;
  const camp = await getCamp(id);
  if (!camp) notFound();

  return (
    <>
      <PageHeader
        title={camp.name}
        description={
          <>
            {camp.stage.name} · {formatDate(camp.startDate)} a {formatDate(camp.endDate)}{" "}
            <Badge variant={camp.status === "open" ? "default" : "secondary"} className="ml-1">
              {campStatusLabels[camp.status]}
            </Badge>
          </>
        }
        actions={
          <Button variant="outline" render={<Link href={`/acampamentos/${camp.id}/editar`} />}>
            Editar
          </Button>
        }
      />
      <Suspense>
        <CampTabs campId={camp.id} />
      </Suspense>
      {children}
    </>
  );
}
