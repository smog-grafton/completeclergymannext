import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutIntentForm } from "@/components/page/CheckoutIntentForm";
import { PageIntro } from "@/components/page/PageIntro";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ book?: string }> }) {
  const slug = (await searchParams).book;
  const book = slug ? await contentRepository.getBookBySlug(slug) : undefined;
  if (!book) notFound();
  return <section className="page page--muted"><div className="content-width" style={{ maxWidth: 930 }}><PageIntro eyebrow="Digital books" title="Secure checkout" description="Your price is calculated by the server. Your library updates only after the provider has securely verified payment." /><CheckoutIntentForm bookSlug={book.slug} bookTitle={book.title} price={book.price.amount} currency={book.price.currency} /></div></section>;
}
