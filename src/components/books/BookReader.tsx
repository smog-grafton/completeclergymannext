"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Book, BookChapter, RichTextBlock } from "@/types";
import { accountFetch } from "@/lib/accountApi";

import { RichText } from "./StickyBookOverview";
import styles from "./books.module.css";

export interface BookReaderProps {
  book: Pick<Book, "title" | "slug" | "chapters">;
  initialChapter?: number;
  className?: string;
  preview?: boolean;
}

export function BookReader({ book, initialChapter = 1, className, preview = false }: BookReaderProps) {
  const [chapters, setChapters] = useState(book.chapters);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const initialIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.number === initialChapter),
  );
  const [chapterIndex, setChapterIndex] = useState(initialIndex);
  const [fontScale, setFontScale] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const classes = [styles.bookReader, isDark ? styles.bookReaderDark : "", className].filter(Boolean).join(" ");
  const progress = useMemo(
    () => (chapters.length ? ((chapterIndex + 1) / chapters.length) * 100 : 0),
    [chapters.length, chapterIndex],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadReader() {
      try {
        const response = await accountFetch(`/books/${book.slug}/${preview ? "preview" : "reader"}`);
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403 ? "Sign in with an active purchase or subscription to read this complete edition." : "This online edition is not available yet.");
        }
        const payload = await response.json() as { data?: { chapters?: Array<{ id: number; number: number; slug?: string; title: string; summary?: string; body?: string; estimatedReadingMinutes?: number; isSample?: boolean }> } };
        const remoteChapters = (payload.data?.chapters ?? []).map((chapter) => ({
          id: chapter.id,
          uuid: `chapter-${chapter.id}`,
          slug: chapter.slug ?? `chapter-${chapter.number}`,
          number: chapter.number,
          title: chapter.title,
          summary: chapter.summary ?? "",
          body: htmlBlocks(chapter.body),
          estimatedReadingMinutes: chapter.estimatedReadingMinutes ?? 0,
          isSample: Boolean(chapter.isSample),
        }));
        if (!cancelled) setChapters(remoteChapters);
      } catch (reason) {
        if (!cancelled) setAccessError(reason instanceof Error ? reason.message : "The reader could not be opened.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadReader();
    return () => { cancelled = true; };
  }, [book.slug, preview]);

  useEffect(() => {
    setChapterIndex(Math.max(0, chapters.findIndex((chapter) => chapter.number === initialChapter)));
  }, [chapters, initialChapter]);

  const chapter = chapters[chapterIndex];

  if (loading) return <div className="surface-panel" aria-busy="true"><p className={styles.bookEyebrow}>Opening reader</p><p>Checking your access to this edition…</p></div>;
  if (accessError) {
    return <div className="empty-state"><h2>Complete edition unavailable</h2><p>{accessError}</p><p style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 24 }}><Link className="button" href={`/login?next=${encodeURIComponent(`/books/${book.slug}/read`)}`}>Sign in</Link><Link className="button--secondary" href={`/checkout?book=${book.slug}`}>Purchase access</Link></p></div>;
  }
  if (!chapter) {
    return <p className={styles.catalogueEmpty}>This book does not have readable chapters yet.</p>;
  }

  return (
    <section className={classes} aria-label={"Reader for " + book.title}>
      <header className={styles.readerHeader}>
        <div>
          <p className={styles.bookEyebrow}>{preview ? "Book preview" : "Online reader"}</p>
          <h1>{book.title}</h1>
        </div>
        <div className={styles.readerControls}>
          <label className={styles.readerSelectLabel}>
            <span className={styles.readerVisuallyHidden}>Choose chapter</span>
            <select
              value={chapter.number}
              onChange={(event) => {
                const next = chapters.findIndex((item) => item.number === Number(event.target.value));
                if (next >= 0) setChapterIndex(next);
              }}
            >
              {chapters.map((item) => (
                <option value={item.number} key={item.id}>
                  {item.number}. {item.title}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => setFontScale((scale) => Math.max(0.9, scale - 0.1))}>
            A−
          </button>
          <button type="button" onClick={() => setFontScale((scale) => Math.min(1.25, scale + 0.1))}>
            A+
          </button>
          <button
            type="button"
            aria-pressed={isDark}
            onClick={() => setIsDark((previous) => !previous)}
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </header>
      <div className={styles.readerProgress} aria-label={"Reading progress: " + Math.round(progress) + "%"}>
        <span style={{ width: progress + "%" }} />
      </div>
      <article className={styles.readerText} style={{ fontSize: fontScale + "rem" }}>
        <p className={styles.readerChapterNumber}>Chapter {chapter.number}</p>
        <h2>{chapter.title}</h2>
        {chapter.summary ? <p className={styles.readerSummary}>{chapter.summary}</p> : null}
        <RichText blocks={chapter.body} />
      </article>
      <footer className={styles.readerFooter}>
        <button
          type="button"
          onClick={() => setChapterIndex((index) => Math.max(0, index - 1))}
          disabled={chapterIndex === 0}
        >
          ← Previous chapter
        </button>
        <span>
          {chapterIndex + 1} of {chapters.length}
        </span>
        <button
          type="button"
          onClick={() => setChapterIndex((index) => Math.min(chapters.length - 1, index + 1))}
          disabled={chapterIndex === chapters.length - 1}
        >
          Next chapter →
        </button>
      </footer>
    </section>
  );
}

export type { BookChapter };

function htmlBlocks(value?: string): RichTextBlock[] {
  if (!value) return [];
  const matches = value.matchAll(/<(h[2-4]|p|blockquote|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi);
  const blocks: RichTextBlock[] = [];
  for (const match of matches) {
    const tag = match[1].toLowerCase();
    const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (tag.startsWith("h")) blocks.push({ type: "heading", level: Number(tag[1]) as 2 | 3, text });
    else if (tag === "blockquote") blocks.push({ type: "quote", text });
    else if (tag === "ul" || tag === "ol") blocks.push({ type: "list", items: [...match[2].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => item[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()) });
    else blocks.push({ type: "paragraph", text });
  }
  return blocks.length ? blocks : [{ type: "paragraph", text: value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() }];
}
