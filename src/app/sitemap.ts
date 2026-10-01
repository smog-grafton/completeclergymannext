import type { MetadataRoute } from "next";
import { contentRepository } from "@/lib/data";

// The sitemap is content-driven, so build it from the current Laravel data at
// request time instead of contacting the API during a Vercel deployment.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, articles, messages, books, podcasts, answers, events, pages] = await Promise.all([
    contentRepository.getSiteConfig(),
    contentRepository.getArticles({ perPage: 100 }),
    contentRepository.getMessages({ perPage: 100 }),
    contentRepository.getBooks({ perPage: 100 }),
    contentRepository.getPodcasts({ perPage: 100 }),
    contentRepository.getClergyQuestions({ perPage: 100 }),
    contentRepository.getEvents({ perPage: 100 }),
    contentRepository.getAboutPages(),
  ]);
  const base = site.domain.replace(/\/$/, "");
  const entry = (path: string, lastModified?: string) => ({ url: base + path, lastModified: lastModified ? new Date(lastModified) : new Date() });

  return [
    entry("/"), entry("/about"), entry("/articles"), entry("/messages"), entry("/books"), entry("/podcasts"), entry("/ask-the-clergy"), entry("/events"), entry("/prayer-wall"), entry("/give"),
    ...pages.map((page) => entry(page.slug === "overview" ? "/about" : "/about/" + page.slug, page.updatedAt)),
    ...articles.data.map((article) => entry("/articles/" + article.slug, article.updatedAt)),
    ...messages.data.map((message) => entry("/messages/" + message.slug, message.updatedAt)),
    ...books.data.map((book) => entry("/books/" + book.slug, book.updatedAt)),
    ...podcasts.data.map((podcast) => entry("/podcasts/" + podcast.slug, podcast.updatedAt)),
    ...answers.data.map((answer) => entry("/ask-the-clergy/" + answer.slug, answer.updatedAt)),
    ...events.data.map((event) => entry("/events/" + event.slug, event.updatedAt)),
  ];
}
