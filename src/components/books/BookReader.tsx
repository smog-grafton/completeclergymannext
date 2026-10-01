"use client";

import { useMemo, useState } from "react";

import type { Book, BookChapter } from "@/types";

import { RichText } from "./StickyBookOverview";
import styles from "./books.module.css";

export interface BookReaderProps {
  book: Pick<Book, "title" | "chapters">;
  initialChapter?: number;
  className?: string;
}

export function BookReader({ book, initialChapter = 1, className }: BookReaderProps) {
  const initialIndex = Math.max(
    0,
    book.chapters.findIndex((chapter) => chapter.number === initialChapter),
  );
  const [chapterIndex, setChapterIndex] = useState(initialIndex);
  const [fontScale, setFontScale] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const chapter = book.chapters[chapterIndex];
  const classes = [styles.bookReader, isDark ? styles.bookReaderDark : "", className].filter(Boolean).join(" ");
  const progress = useMemo(
    () => (book.chapters.length ? ((chapterIndex + 1) / book.chapters.length) * 100 : 0),
    [book.chapters.length, chapterIndex],
  );

  if (!chapter) {
    return <p className={styles.catalogueEmpty}>This book does not have readable chapters yet.</p>;
  }

  return (
    <section className={classes} aria-label={"Reader for " + book.title}>
      <header className={styles.readerHeader}>
        <div>
          <p className={styles.bookEyebrow}>Online reader</p>
          <h1>{book.title}</h1>
        </div>
        <div className={styles.readerControls}>
          <label className={styles.readerSelectLabel}>
            <span className={styles.readerVisuallyHidden}>Choose chapter</span>
            <select
              value={chapter.number}
              onChange={(event) => {
                const next = book.chapters.findIndex((item) => item.number === Number(event.target.value));
                if (next >= 0) setChapterIndex(next);
              }}
            >
              {book.chapters.map((item) => (
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
          {chapterIndex + 1} of {book.chapters.length}
        </span>
        <button
          type="button"
          onClick={() => setChapterIndex((index) => Math.min(book.chapters.length - 1, index + 1))}
          disabled={chapterIndex === book.chapters.length - 1}
        >
          Next chapter →
        </button>
      </footer>
    </section>
  );
}

export type { BookChapter };
