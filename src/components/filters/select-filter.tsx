"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Select que grava a escolha num search param da URL. */
export function SelectFilter({
  param,
  options,
  allLabel,
}: {
  param: string;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = [{ value: null, label: allLabel }, ...options];

  function handleChange(value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(param, value);
    else next.delete(param);
    router.replace(`${pathname}?${next}`);
  }

  return (
    <Select items={items} value={searchParams.get(param)} onValueChange={handleChange}>
      <SelectTrigger className="min-w-48">
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value ?? "__all"} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
