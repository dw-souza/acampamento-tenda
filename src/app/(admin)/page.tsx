import { count } from "drizzle-orm";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { camps, families, parishes, tents } from "@/db/schema";
import { requireUser } from "@/lib/dal";

async function getTotals() {
  await requireUser();
  const [[p], [t], [f], [c]] = await Promise.all([
    db.select({ n: count() }).from(parishes),
    db.select({ n: count() }).from(tents),
    db.select({ n: count() }).from(families),
    db.select({ n: count() }).from(camps),
  ]);
  return [
    { label: "Paróquias", value: p.n },
    { label: "Tendas", value: t.n },
    { label: "Famílias", value: f.n },
    { label: "Acampamentos", value: c.n },
  ];
}

export default async function HomePage() {
  const totals = await getTotals();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Início</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {totals.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
