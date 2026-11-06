import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "guardian";
};

// Data Access Layer: toda leitura e escrita do admin passa por aqui.
// O proxy só faz um redirecionamento otimista; a checagem real é esta.
export const requireUser = cache(async (): Promise<CurrentUser> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id, name, email, role } = session.user;
  return { id, name, email, role: role as CurrentUser["role"] };
});
