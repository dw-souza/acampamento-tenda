import { AlertTriangle, Church, Plus, Tent, Users, UsersRound } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  attentionPoints,
  communityTotals,
  parishSummary,
  recentCampsByStage,
  STALLED_YEARS,
  tentsByStage,
  upcomingCamps,
} from "@/lib/data/dashboard";
import { campLabel, formatDate, plural, tentLabel } from "@/lib/format/labels";
import { campStatusLabels } from "@/lib/validation/camp";
import { StageBars } from "./_dashboard/stage-bars";
import { StatusBadge } from "@/components/status-badge";
import { campStatusTone } from "@/lib/format/status";
import { StatTile } from "@/components/stat-tile";

export default async function HomePage() {
  const [totals, stages, upcoming, recent, attention, parishes] = await Promise.all([
    communityTotals(),
    tentsByStage(),
    upcomingCamps(),
    recentCampsByStage(3),
    attentionPoints(),
    parishSummary(),
  ]);

  const tiles = [
    {
      icon: Tent,
      label: "Tendas ativos",
      value: totals.activeTents,
      detail:
        totals.formingTents > 0 ? `+ ${plural(totals.formingTents, "em formação", "em formação")}` : null,
    },
    { icon: Users, label: "Famílias", value: totals.families, detail: "nos tendas ativos" },
    {
      icon: UsersRound,
      label: "Pessoas",
      value: totals.adults + totals.children,
      detail: `${plural(totals.adults, "adulto", "adultos")} · ${plural(totals.children, "filho", "filhos")}`,
    },
    { icon: Church, label: "Paróquias", value: totals.parishes, detail: null },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="tenda-pattern flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-6 text-primary-foreground shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Comunidade Tenda</h1>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Ser família em comunhão com Deus e com o próximo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            render={<Link href="/acampamentos/novo" />}
            className="bg-tenda-yellow text-tenda-brown hover:bg-tenda-yellow/90"
          >
            <Plus /> Novo acampamento
          </Button>
          <Button
            variant="outline"
            render={<Link href="/familias/nova" />}
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Plus /> Nova família
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile
            key={tile.label}
            icon={tile.icon}
            label={tile.label}
            value={tile.value}
            detail={tile.detail}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tendas por etapa</CardTitle>
            <CardDescription>
              Etapa atual de cada tenda ativo. Passe o mouse para ver quais são.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StageBars rows={stages} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Próximos acampamentos</CardTitle>
              <Button size="sm" variant="outline" render={<Link href="/acampamentos/novo" />}>
                Novo
              </Button>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum acampamento marcado.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {upcoming.map((camp) => (
                    <CampItem key={camp.id} camp={camp}>
                      <StatusBadge tone={campStatusTone[camp.status]}>
                        {campStatusLabels[camp.status]}
                      </StatusBadge>
                    </CampItem>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <AttentionCard attention={attention} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Últimos acampamentos por etapa</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum acampamento realizado ainda.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recent.map((group) => (
              <Card key={group.stageName} size="sm">
                <CardHeader>
                  <CardTitle>{group.stageName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-3">
                    {group.camps.map((camp) => (
                      <CampItem key={camp.id} camp={camp} />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Paróquias</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {parishes.map((parish) => (
              <li key={parish.id} className="flex justify-between gap-4 text-sm">
                <Link href={`/tendas?paroquia=${parish.id}`} className="hover:underline">
                  {parish.name}
                </Link>
                <span className="text-muted-foreground tabular-nums">
                  {plural(parish.tents, "tenda", "tendas")} · {plural(parish.families, "família", "famílias")}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

type CampSummary = Awaited<ReturnType<typeof upcomingCamps>>[number];

function CampItem({ camp, children }: { camp: CampSummary; children?: ReactNode }) {
  return (
    <li className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Link href={`/acampamentos/${camp.id}`} className="font-medium hover:underline">
          {campLabel({
            startDate: camp.startDate,
            stage: { name: camp.stageName, formsTents: camp.stageFormsTents },
          })}
        </Link>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatDate(camp.startDate)} a {formatDate(camp.endDate)} ·{" "}
          {plural(camp.campers ?? 0, "família campista", "famílias campistas")} ·{" "}
          {plural(camp.servers ?? 0, "servindo", "servindo")}
        </p>
      </div>
      {children}
    </li>
  );
}

function AttentionCard({ attention }: { attention: Awaited<ReturnType<typeof attentionPoints>> }) {
  const items: { key: string; text: ReactNode }[] = [];
  if (attention.noStage.length > 0) {
    items.push({
      key: "stage",
      text: (
        <>
          <Link href="/tendas?etapa=nenhuma" className="font-medium hover:underline">
            {plural(attention.noStage.length, "tenda sem etapa", "tendas sem etapa")}
          </Link>{" "}
          registrada: não podem servir nem ser sugeridos para acampamentos.
        </>
      ),
    });
  }
  if (attention.noGuardian.length > 0) {
    items.push({
      key: "guardian",
      text: (
        <>
          <span className="font-medium">
            {plural(attention.noGuardian.length, "tenda", "tendas")} sem guardiões:
          </span>{" "}
          {attention.noGuardian.map((tent, i) => (
            <span key={tent.id}>
              {i > 0 && ", "}
              <Link href={`/tendas/${tent.id}/editar`} className="hover:underline">
                {tentLabel(tent)} ({tent.parish.name})
              </Link>
            </span>
          ))}
        </>
      ),
    });
  }
  if (attention.stalled.length > 0) {
    items.push({
      key: "stalled",
      text: (
        <>
          <span className="font-medium">
            {plural(attention.stalled.length, "tenda", "tendas")} há mais de {STALLED_YEARS} anos na mesma
            etapa:
          </span>{" "}
          {attention.stalled.map((tent, i) => (
            <span key={tent.id}>
              {i > 0 && ", "}
              <Link href={`/tendas/${tent.id}`} className="hover:underline">
                {tentLabel(tent)} ({tent.parishName}, {tent.stageName} desde {formatDate(tent.since)})
              </Link>
            </span>
          ))}
        </>
      ),
    });
  }
  if (attention.overdue.length > 0) {
    items.push({
      key: "overdue",
      text: (
        <>
          <span className="font-medium">
            {plural(attention.overdue.length, "acampamento já passou", "acampamentos já passaram")} e não{" "}
            {attention.overdue.length === 1 ? "foi concluído" : "foram concluídos"}:
          </span>{" "}
          {attention.overdue.map((camp, i) => (
            <span key={camp.id}>
              {i > 0 && ", "}
              <Link href={`/acampamentos/${camp.id}`} className="hover:underline">
                {campLabel({
                  startDate: camp.startDate,
                  stage: { name: camp.stageName, formsTents: camp.stageFormsTents },
                })}
              </Link>
            </span>
          ))}
        </>
      ),
    });
  }
  if (attention.familiesWithoutTent > 0) {
    items.push({
      key: "family",
      text: (
        <>
          <Link href="/familias?tenda=nenhuma" className="font-medium hover:underline">
            {plural(attention.familiesWithoutTent, "família sem tenda", "famílias sem tenda")}
          </Link>{" "}
          fora de um Kerigma em andamento.
        </>
      ),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pontos de atenção</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tudo em ordem.</p>
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {items.map((item) => (
              <li key={item.key} className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-label="Atenção" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
