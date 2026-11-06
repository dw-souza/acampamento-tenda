import { Suspense } from "react";
import { AdminNav } from "@/components/admin-nav";
import { UserMenu } from "@/components/user-menu";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AdminNav
        userMenu={
          <Suspense>
            <UserMenu />
          </Suspense>
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
