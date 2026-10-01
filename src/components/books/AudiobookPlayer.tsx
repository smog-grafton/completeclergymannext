"use client";

import { useMemo, useState } from "react";

import type { Book } from "@/types";

import { AudioPlayer } from "@/components/editorial/AudioPlayer";

import styles from "./books.module.css";

export interface AudiobookPlayerProps {
  book: Pick<Book, "title" | "chapters">;
  initialChapter?: number;
  className?: string;
}

export function AudiobookPlayer({ book, initialChapter = 1, className }: AudiobookPlayerProps) {
  const chapters = useMemo(() => book.chapters.filter((chapter) => chapter.audio), [book.chapters]);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(
      0,
      chapters.findIndex((chapter) => chapter.number === initialChapter),
    ),
  );
  const activeChapter = chapters[activeIndex];
  const classes = [styles.audiobookPlayer, className].filter(Boolean).join(" ");

  if (!activeChapter?.audio) {
    return <p className={styles.catalogueEmpty}>An audio edition is not available for this book yet.</p>;
  }

  return (
    <section className={classes} aria-label={"Audiobook for " + book.title}>
      <header className={styles.audiobookHeader}>
        <p className={styles.bookEyebrow}>Audio edition</p>
        <h1>{book.title}</h1>
        <p>
          Chapter {activeChapter.number}: {activeChapter.title}
        </p>
      </header>
      <AudioPlayer
        key={activeChapter.id}
        title={"Chapter " + activeChapter.number + ": " + activeChapter.title}
        src={activeChapter.audio.url}
        duration={activeChapter.audio.durationSeconds}
        onComplete={() => {
          if (activeIndex < chapters.length - 1) setActiveIndex((index) => index + 1);
        }}
      />
      <ol className={styles.audiobookChapterList}>
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <button
              className={index === activeIndex ? styles.audiobookChapterActive : ""}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <span>
                <strong>Chapter {chapter.number}</strong>
                <span>{chapter.title}</span>
              </span>
              <time>{formatDuration(chapter.audio?.durationSeconds ?? 0)}</time>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return String(minutes) + ":" + String(seconds % 60).padStart(2, "0");
}
