import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudiobookPlayer } from "@/components/books";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Audiobook" };

export default async function BookAudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const book = await contentRepository.getBookBySlug((await params).slug);
  if (!book) notFound();
  return <section className="page page--muted"><div className="content-width"><AudiobookPlayer book={book} /></div></section>;
}
