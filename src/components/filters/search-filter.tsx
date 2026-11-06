"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

/** Busca por texto gravada no search param `q`, com pequeno atraso. */
export function SearchFilter({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value === (searchParams.get("q") ?? "")) return;
      const next = new URLSearchParams(searchParams);
      if (value) next.set("q", value);
      else next.delete("q");
      router.replace(`${pathname}?${next}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, pathname, router, searchParams]);

  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className="max-w-xs"
    />
  );
}
