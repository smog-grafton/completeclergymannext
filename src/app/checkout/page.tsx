import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPrice } from "@/components/books";
import { CheckoutIntentForm } from "@/components/page/CheckoutIntentForm";
import { PageIntro } from "@/components/page/PageIntro";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ book?: string }> }) {
  const slug = (await searchParams).book;
  const book = slug ? await contentRepository.getBookBySlug(slug) : undefined;
  if (!book) notFound();
  return <section className="page page--muted"><div className="content-width" style={{ maxWidth: 930 }}><PageIntro eyebrow="Digital books" title="Save your order" description="Create a pending order for this resource. Payment is only collected after a secure provider has been configured." /><CheckoutIntentForm bookSlug={book.slug} bookTitle={book.title} priceLabel={formatPrice(book.price.amount, book.price.currency)} /></div></section>;
}
