import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookReader, FlipbookReader } from "@/components/books";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Online reader" };

export default async function BookReaderPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ chapter?: string; format?: string }> }) {
  const book = await contentRepository.getBookBySlug((await params).slug);
  if (!book) notFound();
  const query = await searchParams;
  const chapter = Number(query.chapter ?? 1);
  const useFlipbook = query.format === "flipbook" && book.formats.some((format) => format.kind === "flipbook" && format.isAvailable);
  return <section className="page page--muted"><div className={useFlipbook ? "" : "content-width"}>{useFlipbook ? <FlipbookReader slug={book.slug} title={book.title} /> : <BookReader book={book} initialChapter={Number.isFinite(chapter) ? chapter : 1} />}</div></section>;
}
