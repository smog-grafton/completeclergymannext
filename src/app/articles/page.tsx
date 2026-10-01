import type { Metadata } from "next";
import { ResourceCard } from "@/components/editorial";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { toArticleResource } from "@/components/page/adapters";
import { contentRepository } from "@/lib/data";
import { firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = {
  title: "Articles",
  description: "Thoughtful essays for the inner life and public work of Christian ministry.",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const [categories, topics, result] = await Promise.all([
    contentRepository.getArticles({ perPage: 100 }),
    contentRepository.getArticles({ perPage: 100 }),
    contentRepository.getArticles({
      query: firstParam(params.q),
      category: firstParam(params.category),
      topic: firstParam(params.topic),
      language: firstParam(params.language) as "en" | "lg" | "sw" | undefined,
      perPage: 48,
    }),
  ]);

  const categoryOptions = [...new Map(categories.data.map((article) => [article.category.slug, article.category.name])).entries()].map(([value, label]) => ({ value, label }));
  const topicOptions = [...new Map(topics.data.flatMap((article) => article.topics.map((topic) => [topic.slug, topic.name] as const))).entries()].map(([value, label]) => ({ value, label }));

  return (
    <section className="page">
      <div className="content-width">
        <PageIntro eyebrow="The publication" title="Articles" description="Long-form reading for those entrusted with the care, formation, and witness of the church." />
        <ResourceFilters
          filters={[
            { name: "q", label: "Search", type: "search", placeholder: "Search articles" },
            { name: "category", label: "Category", options: categoryOptions },
            { name: "topic", label: "Topic", options: topicOptions },
            { name: "language", label: "Language", options: [{ value: "en", label: "English" }, { value: "lg", label: "Luganda" }, { value: "sw", label: "Swahili" }] },
          ]}
        />
        {result.data.length ? (
          <div className="resource-grid">
            {result.data.map((article) => <ResourceCard key={article.id} resource={toArticleResource(article)} />)}
          </div>
        ) : (
          <div className="empty-state"><h2>No articles found</h2><p>Try a different phrase, topic, language, or category.</p></div>
        )}
      </div>
    </section>
  );
}
