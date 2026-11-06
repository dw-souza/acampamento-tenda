import Image from "next/image";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { MobileNav, NavLinks } from "./nav-links";

export function AdminNav({ userMenu }: { userMenu: ReactNode }) {
  return (
    <header className="tenda-pattern sticky top-0 z-30 text-primary-foreground shadow-sm print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-stretch gap-4 px-4">
        <div className="flex items-center gap-1">
          <Suspense>
            <MobileNav />
          </Suspense>
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            {/* O logo é branco, feito para o fundo marrom. */}
            <Image src="/logo_tenda.webp" alt="" width={40} height={40} priority />
            <span className="font-heading text-lg leading-tight font-bold">
              Comunidade
              <br className="sm:hidden" /> Tenda
            </span>
          </Link>
        </div>
        <div className="flex flex-1 justify-center xl:ml-6">
          <Suspense>
            <NavLinks />
          </Suspense>
        </div>
        <div className="flex items-center">{userMenu}</div>
      </div>
    </header>
  );
}
