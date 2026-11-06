"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function CampTabs({ campId }: { campId: string }) {
  const pathname = usePathname();
  const base = `/acampamentos/${campId}`;
  const tabs = [
    { href: base, label: "Visão geral" },
    { href: `${base}/campistas`, label: "Campistas" },
    { href: `${base}/equipes`, label: "Equipes" },
    { href: `${base}/tesouraria`, label: "Tesouraria" },
  ];

  return (
    <nav className="mb-6 flex gap-1 border-b">
      {tabs.map((tab) => {
        const active = tab.href === base ? pathname === base : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
