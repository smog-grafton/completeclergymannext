import type { Metadata } from "next";
import { BookCatalogue } from "@/components/books";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { contentRepository } from "@/lib/data";
import { firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Books", description: "Digital books for thoughtful, durable ministry formation.", alternates: { canonical: "/books" } };

export default async function BooksPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const [categories, allBooks, books] = await Promise.all([
    contentRepository.getBookCategories(),
    contentRepository.getBooks({ perPage: 100 }),
    contentRepository.getBooks({ query: firstParam(params.q), category: firstParam(params.category), author: firstParam(params.author), language: firstParam(params.language) as "en" | "lg" | "sw" | undefined, perPage: 100 }),
  ]);
  const authors = [...new Map(allBooks.data.flatMap((book) => book.authors.map((author) => [author.slug, author.name] as const))).entries()].map(([value, label]) => ({ value, label }));
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Digital library" title="Books" description="Read, listen, and build a working library for the long vocation of ministry." /><ResourceFilters filters={[
    { name: "q", label: "Search books", type: "search", placeholder: "Search title or author" }, { name: "category", label: "Category", options: categories.map((category) => ({ value: category.slug, label: category.name })) }, { name: "author", label: "Author", options: authors }, { name: "language", label: "Language", options: [{ value: "en", label: "English" }, { value: "lg", label: "Luganda" }, { value: "sw", label: "Swahili" }] },
  ]} /><BookCatalogue books={books.data} initialCount={10} loadStep={8} /></div></section>;
}
