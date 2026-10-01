"use client";

import { useEffect, useRef, useState } from "react";

import type { BookWithRelations } from "@/types";

import { BookCard } from "./BookCard";
import styles from "./books.module.css";

export interface BookCatalogueProps {
  books: BookWithRelations[];
  initialCount?: number;
  loadStep?: number;
  emptyMessage?: string;
  className?: string;
}

/**
 * A client-side pagination layer for phase-one data. Its interface intentionally
 * receives an API collection rather than importing local content arrays,
 * server page to pass a paged Laravel response or replace it entirely.
 */
export function BookCatalogue({
  books,
  initialCount = 12,
  loadStep = 8,
  emptyMessage = "No books match these filters.",
  className,
}: BookCatalogueProps) {
  const [visibleCount, setVisibleCount] = useState(Math.min(initialCount, books.length));
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    setVisibleCount(Math.min(initialCount, books.length));
    setIsLoading(false);
    loadingRef.current = false;
  }, [books, initialCount]);

  const hasMore = visibleCount < books.length;

  function loadMore() {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoading(true);

    // The short pending state preserves a meaningful skeleton while API data
    // is local. Replacing this with API pagination will not affect consumers.
    window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + loadStep, books.length));
      setIsLoading(false);
      loadingRef.current = false;
    }, 180);
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "340px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  });

  if (!books.length) {
    return <p className={styles.catalogueEmpty}>{emptyMessage}</p>;
  }

  const visibleBooks = books.slice(0, visibleCount);
  const classes = [styles.bookCatalogue, className].filter(Boolean).join(" ");

  return (
    <section className={classes} aria-label="Book catalogue">
      <div className={styles.bookGrid}>
        {visibleBooks.map((book, index) => (
          <BookCard key={book.id} book={book} priority={index < 4} />
        ))}
      </div>
      {isLoading ? (
        <div className={styles.bookGrid} aria-label="Loading more books" aria-live="polite">
          {Array.from({ length: Math.min(loadStep, 4) }, (_, index) => (
            <div className={styles.bookSkeleton} key={index} aria-hidden="true">
              <span />
              <i />
              <i />
            </div>
          ))}
        </div>
      ) : null}
      <div ref={sentinelRef} className={styles.catalogueSentinel} aria-hidden="true" />
      {hasMore && !isLoading ? (
        <button className={styles.catalogueLoadMore} type="button" onClick={loadMore}>
          Load more books
        </button>
      ) : null}
      {!hasMore ? <p className={styles.catalogueComplete}>You have reached the end of the catalogue.</p> : null}
    </section>
  );
}
