import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookReader } from "@/components/books";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Online reader" };

export default async function BookReaderPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ chapter?: string }> }) {
  const book = await contentRepository.getBookBySlug((await params).slug);
  if (!book) notFound();
  const chapter = Number((await searchParams).chapter ?? 1);
  return <section className="page page--muted"><div className="content-width"><BookReader book={book} initialChapter={Number.isFinite(chapter) ? chapter : 1} /></div></section>;
}
