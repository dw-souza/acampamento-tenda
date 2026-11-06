"use client";

import {
  CalendarDays,
  Church,
  HeartHandshake,
  House,
  Menu,
  Route,
  Tent,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Início", icon: House },
  { href: "/acampamentos", label: "Acampamentos", icon: CalendarDays },
  { href: "/familias", label: "Famílias", icon: Users },
  { href: "/tendas", label: "Tendas", icon: Tent },
  { href: "/paroquias", label: "Paróquias", icon: Church },
  { href: "/equipes", label: "Equipes", icon: HeartHandshake },
  { href: "/etapas", label: "Etapas", icon: Route },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Links da navbar (telas médias e grandes). */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden h-full items-stretch gap-1 xl:flex">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-2.5 text-sm font-medium transition-colors",
              active
                ? "border-tenda-yellow text-primary-foreground"
                : "border-transparent text-primary-foreground/75 hover:border-primary-foreground/40 hover:text-primary-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Menu em gaveta para celular e tablet. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground xl:hidden"
            aria-label="Abrir menu"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Comunidade Tenda</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
