import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getParish } from "@/lib/data/parishes";
import { ParishForm } from "../parish-form";

export default async function EditParishPage({ params }: PageProps<"/paroquias/[id]">) {
  const { id } = await params;
  const parish = await getParish(id);
  if (!parish) notFound();

  return (
    <>
      <PageHeader title={parish.name} />
      <ParishForm
        id={parish.id}
        defaultValues={{
          name: parish.name,
          city: parish.city,
          state: parish.state,
          address: parish.address ?? "",
          zipCode: parish.zipCode ?? "",
          phone: parish.phone ?? "",
          email: parish.email ?? "",
          responsibleName: parish.responsibleName ?? "",
          responsiblePhone: parish.responsiblePhone ?? "",
          active: parish.active,
        }}
      />
    </>
  );
}
