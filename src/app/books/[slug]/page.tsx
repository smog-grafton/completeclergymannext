import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCard, StickyBookOverview } from "@/components/books";
import { JsonLd } from "@/components/page/JsonLd";
import { RichText } from "@/components/page/RichText";
import { contentRepository } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const book = await contentRepository.getBookBySlug((await params).slug);
  return book ? { title: book.seo.title ?? book.title, description: book.seo.description ?? book.shortDescription } : { title: "Book not found" };
}

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const book = await contentRepository.getBookBySlug((await params).slug);
  if (!book) notFound();
  const related = await contentRepository.getRelatedBooks(book.id, 4);
  const audioAvailable = book.formats.some((format) => format.kind === "audio" && format.isAvailable);
  return <article className="page"><div className="content-width"><StickyBookOverview book={book} purchaseHref={`/checkout?book=${book.slug}`} sampleHref={`/books/${book.slug}/read${book.accessType === "free" ? "" : "?sample=1"}`} audioHref={`/books/${book.slug}/audio`}><RichText blocks={book.description} className="" /><section style={{ marginTop: 48 }}><p className="eyebrow">Inside this book</p><div style={{ borderTop: "1px solid var(--border)" }}>{book.chapters.map((chapter) => <div className="resource-row" key={chapter.id} style={{ gridTemplateColumns: "58px 1fr" }}><p className="resource-row__type">{String(chapter.number).padStart(2, "0")}</p><div><h3>{chapter.title}</h3><p>{chapter.summary}</p></div></div>)}</div></section><section className="surface-panel" style={{ marginTop: 46 }}><p className="eyebrow">Available formats</p><div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>{book.formats.filter((format) => format.isAvailable).map((format) => <Link className="button--secondary" href={book.accessType !== "free" ? `/checkout?book=${book.slug}` : format.kind === "online-reader" ? `/books/${book.slug}/read` : format.kind === "flipbook" ? `/books/${book.slug}/read?format=flipbook` : format.kind === "audio" ? `/books/${book.slug}/audio` : format.fileUrl ?? `/books/${book.slug}/read`} key={format.kind}>{format.label}</Link>)}</div>{book.accessType !== "free" ? <p className="field-help">Choose an edition to continue to the secure checkout. Purchased editions appear in your account library after payment is verified.</p> : null}{audioAvailable ? <p className="field-help">Audio edition includes selected chapter-by-chapter listening.</p> : null}</section></StickyBookOverview>
    {related.length ? <section style={{ marginTop: 90 }}><div className="section-heading"><h2>Related books</h2><Link href="/books">Browse the library →</Link></div><div className="grid-4">{related.map((item) => <BookCard key={item.id} book={item} />)}</div></section> : null}
  </div><JsonLd data={{ "@context": "https://schema.org", "@type": "Book", name: book.title, description: book.shortDescription, author: book.authors.map((author) => ({ "@type": "Person", name: author.name })), isbn: book.isbn, numberOfPages: book.pageCount, offers: { "@type": "Offer", price: book.price.amount, priceCurrency: book.price.currency, availability: "https://schema.org/InStock" } }} /></article>;
}
