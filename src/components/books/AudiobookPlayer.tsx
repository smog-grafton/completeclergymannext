"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Book } from "@/types";
import { MediaPlaybackGate } from "@/components/media";
import { accountFetch } from "@/lib/accountApi";
import styles from "./books.module.css";

interface ChapterAudio { id: number; number: number; title: string; sourceId?: number; durationSeconds?: number }

export interface AudiobookPlayerProps {
  book: Pick<Book, "slug" | "title" | "chapters"> & { hasMedia?: boolean };
  initialChapter?: number;
  className?: string;
}

export function AudiobookPlayer({ book, initialChapter = 1, className }: AudiobookPlayerProps) {
  const [chapters, setChapters] = useState<ChapterAudio[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const classes = [styles.audiobookPlayer, className].filter(Boolean).join(" ");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await accountFetch(`/books/${encodeURIComponent(book.slug)}/reader`);
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Sign in with an active purchase or subscription to listen to this edition." : "This audio edition is not available yet.");
        const payload = await response.json() as { data?: { chapters?: Array<{ id: number; number: number; title: string; audioSourceId?: number; audioDurationSeconds?: number }> } };
        const audioChapters = (payload.data?.chapters ?? []).filter((chapter) => Boolean(chapter.audioSourceId)).map((chapter) => ({ id: chapter.id, number: chapter.number, title: chapter.title, sourceId: chapter.audioSourceId, durationSeconds: chapter.audioDurationSeconds }));
        if (!cancelled) { setChapters(audioChapters); setActiveIndex(Math.max(0, audioChapters.findIndex((chapter) => chapter.number === initialChapter))); }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "The audio edition could not be opened.");
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [book.slug, initialChapter]);

  if (loading) return <div className="surface-panel" aria-busy="true"><p className={styles.bookEyebrow}>Opening audio edition</p><p>Checking your access…</p></div>;
  if (error) return <div className="empty-state"><h2>Audio edition unavailable</h2><p>{error}</p>{error.startsWith("Sign in") ? <p style={{ marginTop: 24 }}><Link className="button" href={`/login?next=${encodeURIComponent(`/books/${book.slug}/audio`)}`}>Sign in</Link></p> : null}</div>;
  const chapter = chapters[activeIndex];
  if (!chapter && !book.hasMedia) return <p className={styles.catalogueEmpty}>An audio edition is not available for this book yet.</p>;

  return <section className={classes} aria-label={`Audiobook for ${book.title}`}>
    <header className={styles.audiobookHeader}><p className={styles.bookEyebrow}>Audio edition</p><h1>{book.title}</h1>{chapter ? <p>Chapter {chapter.number}: {chapter.title}</p> : <p>Complete edition</p>}</header>
    {chapter?.sourceId ? <MediaPlaybackGate key={chapter.sourceId} sourceId={chapter.sourceId} title={`Chapter ${chapter.number}: ${chapter.title}`} artist={book.title} kind="audio" onAudioEnded={() => setActiveIndex((index) => Math.min(index + 1, chapters.length - 1))} /> : <MediaPlaybackGate manifestEndpoint={`/books/${encodeURIComponent(book.slug)}`} title={book.title} artist="Complete Clergyman audiobook" kind="audio" />}
    {chapters.length ? <ol className={styles.audiobookChapterList}>{chapters.map((item, index) => <li key={item.id}><button className={index === activeIndex ? styles.audiobookChapterActive : ""} type="button" onClick={() => setActiveIndex(index)} aria-current={index === activeIndex ? "true" : undefined}><span><strong>Chapter {item.number}</strong><span>{item.title}</span></span><time>{formatDuration(item.durationSeconds ?? 0)}</time></button></li>)}</ol> : null}
  </section>;
}

function formatDuration(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
