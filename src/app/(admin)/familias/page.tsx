import { Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SearchFilter } from "@/components/filters/search-filter";
import { SelectFilter } from "@/components/filters/select-filter";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listFamilies } from "@/lib/data/families";
import { parishOptions } from "@/lib/data/parishes";
import { coupleName, tentLabel } from "@/lib/format/labels";

export default async function FamiliesPage({ searchParams }: PageProps<"/familias">) {
  const { q, paroquia, tenda } = await searchParams;
  const [families, parishes] = await Promise.all([
    listFamilies({
      q: typeof q === "string" ? q : undefined,
      parishId: typeof paroquia === "string" ? paroquia : undefined,
      tentId: typeof tenda === "string" ? tenda : undefined,
    }),
    parishOptions(),
  ]);

  const rows = families
    .map((family) => {
      const contact = family.people.find((person) => person.role === family.mainContactRole);
      return {
        id: family.id,
        name: coupleName(family.people),
        parish: family.parish.name,
        tent: family.tent ? tentLabel(family.tent) : "—",
        children: family.people.filter((person) => person.role === "child").length,
        phone: contact?.phone ?? "",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader
        icon={Users}
        title="Famílias"
        actions={<Button render={<Link href="/familias/nova" />}>Nova família</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Suspense>
          <SearchFilter placeholder="Buscar por nome..." />
          <SelectFilter param="paroquia" options={parishes} allLabel="Todas as paróquias" />
          <SelectFilter
            param="tenda"
            options={[{ value: "nenhuma", label: "Sem tenda" }]}
            allLabel="Com ou sem tenda"
          />
        </Suspense>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Casal</TableHead>
            <TableHead>Paróquia</TableHead>
            <TableHead>Tenda</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead className="text-right">Filhos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Nenhuma família encontrada.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link href={`/familias/${row.id}`} className="font-medium hover:underline">
                  {row.name}
                </Link>
              </TableCell>
              <TableCell>{row.parish}</TableCell>
              <TableCell>{row.tent}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell className="text-right tabular-nums">{row.children}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
