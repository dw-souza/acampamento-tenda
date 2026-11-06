import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

const links = [
  { href: "/", label: "Início" },
  { href: "/acampamentos", label: "Acampamentos" },
  { href: "/familias", label: "Famílias" },
  { href: "/tendas", label: "Tendas" },
  { href: "/paroquias", label: "Paróquias" },
  { href: "/equipes", label: "Equipes" },
  { href: "/etapas", label: "Etapas" },
];

export function AdminNav({ userMenu }: { userMenu: ReactNode }) {
  return (
    <header className="border-b bg-background print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          {/* O logo é branco: precisa de fundo escuro. */}
          <Image
            src="/logo_tenda.webp"
            alt=""
            width={28}
            height={28}
            className="rounded-md bg-primary p-0.5"
          />
          <span className="sr-only sm:not-sr-only">Acampamento Tenda</span>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto text-sm whitespace-nowrap text-muted-foreground">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        {userMenu}
      </div>
    </header>
  );
}
