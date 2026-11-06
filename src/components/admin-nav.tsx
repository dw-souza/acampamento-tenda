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
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/logo_tenda.webp" alt="" width={28} height={28} />
          Acampamento Tenda
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm text-muted-foreground">
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
