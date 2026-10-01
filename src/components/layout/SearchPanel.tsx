"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/button";
import styles from "./site-header.module.css";
import type { HeaderSearchConfig, HeaderSearchResult } from "./navigation.types";

export interface SearchPanelProps {
  config?: HeaderSearchConfig;
  onClose: () => void;
  onResultSelect?: (result: HeaderSearchResult) => void;
  open: boolean;
}

function containsQuery(result: HeaderSearchResult, query: string) {
  const haystack = [result.title, result.type, result.excerpt, ...(result.keywords ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  return haystack.includes(query);
}

/**
 * A locally filterable search panel. In a connected app, callers can use
 * `config.onQueryChange` to trigger debounced API search while still passing
 * the latest result collection through `config.items`.
 */
export function SearchPanel({ config, onClose, onResultSelect, open }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const providedItems = config?.items;

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return (providedItems ?? []).filter((item) => containsQuery(item, normalizedQuery)).slice(0, 8);
  }, [providedItems, normalizedQuery]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  if (!open) {
    return null;
  }

  const handleChange = (value: string) => {
    setQuery(value);
    config?.onQueryChange?.(value);
  };

  return (
    <section
      aria-label={config?.label ?? "Search Complete Clergyman resources"}
      className={styles.searchPanel}
      id="site-search-panel"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      role="search"
    >
      <div className={styles.searchPanelInner}>
        <div className={styles.searchFieldRow}>
          <Icon className={styles.searchFieldIcon} name="search" size={21} />
          <label className={styles.visuallyHidden} htmlFor={inputId}>
            {config?.label ?? "Search Complete Clergyman resources"}
          </label>
          <input
            ref={inputRef}
            className={styles.searchField}
            id={inputId}
            onChange={(event) => handleChange(event.target.value)}
            placeholder={config?.placeholder ?? "Search articles, books, messages, and more"}
            type="search"
            value={query}
          />
          <IconButton aria-label="Close search" className={styles.searchClose} onClick={onClose}>
            <Icon name="close" size={20} />
          </IconButton>
        </div>

        <div aria-live="polite" className={styles.searchResults}>
          {!normalizedQuery ? (
            <p className={styles.searchHint}>
              {config?.emptyMessage ?? "Begin with a title, topic, or ministry question."}
            </p>
          ) : results.length ? (
            <ul className={styles.searchResultsList}>
              {results.map((result) => (
                <li key={result.id}>
                  <a
                    className={styles.searchResult}
                    href={result.href}
                    onClick={() => onResultSelect?.(result)}
                  >
                    <span className={styles.searchResultType}>{result.type}</span>
                    <span className={styles.searchResultTitle}>{result.title}</span>
                    {result.excerpt ? <span className={styles.searchResultExcerpt}>{result.excerpt}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.searchHint}>
              {config?.noResultsMessage ?? "No resources match that search yet."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
