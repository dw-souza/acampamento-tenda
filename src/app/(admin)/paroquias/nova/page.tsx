import { PageHeader } from "@/components/page-header";
import { ParishForm } from "../parish-form";

export default function NewParishPage() {
  return (
    <>
      <PageHeader title="Nova paróquia" />
      <ParishForm
        id={null}
        defaultValues={{
          name: "",
          city: "",
          state: "",
          address: "",
          zipCode: "",
          phone: "",
          email: "",
          responsibleName: "",
          responsiblePhone: "",
          active: true,
        }}
      />
    </>
  );
}
