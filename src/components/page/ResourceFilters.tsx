"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  name: string;
  label: string;
  placeholder?: string;
  options?: FilterOption[];
  type?: "search" | "select";
}

interface ResourceFiltersProps {
  filters: FilterDefinition[];
}

/**
 * Keeps list filters in the URL, so the Laravel repository and
 * endpoint share the same public filtering contract.
 */
export function ResourceFilters({ filters }: ResourceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete("page");
    const query = next.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <form className="filter-bar" aria-label="Filter resources" onSubmit={(event) => event.preventDefault()}>
      {filters.map((filter) => {
        const value = searchParams.get(filter.name) ?? "";
        const id = `filter-${filter.name}`;
        const isSearch = filter.type === "search";

        return (
          <div key={filter.name} className="form-field">
            <label className="field-label" htmlFor={id}>{filter.label}</label>
            {isSearch ? (
              <input
                className="field"
                id={id}
                type="search"
                defaultValue={value}
                placeholder={filter.placeholder ?? "Search"}
                onChange={(event) => update(filter.name, event.target.value)}
              />
            ) : (
              <select
                className="field"
                id={id}
                value={value}
                onChange={(event) => update(filter.name, event.target.value)}
              >
                <option value="">All</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}
      {isPending ? <span className="sr-only" role="status">Updating results</span> : null}
    </form>
  );
}
