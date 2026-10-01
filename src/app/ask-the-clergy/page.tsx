import type { Metadata } from "next";
import Link from "next/link";
import { ResourceCard } from "@/components/editorial";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { toQuestionResource } from "@/components/page/adapters";
import { contentRepository } from "@/lib/data";
import { firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Ask the Clergy", description: "Careful answers to questions about ministry, calling, theology, and pastoral life.", alternates: { canonical: "/ask-the-clergy" } };

export default async function AskTheClergyPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const [all, result] = await Promise.all([
    contentRepository.getClergyQuestions({ perPage: 100 }),
    contentRepository.getClergyQuestions({ query: firstParam(params.q), category: firstParam(params.category), topic: firstParam(params.topic), perPage: 40 }),
  ]);
  const categories = [...new Map(all.data.map((question) => [question.category.slug, question.category.name])).entries()].map(([value, label]) => ({ value, label }));
  const topics = [...new Map(all.data.flatMap((question) => question.topics.map((topic) => [topic.slug, topic.name] as const))).entries()].map(([value, label]) => ({ value, label }));
  const featured = result.data.find((question) => question.featured);
  const remaining = featured ? result.data.filter((question) => question.id !== featured.id) : result.data;

  return <section className="page"><div className="content-width"><PageIntro eyebrow="Questions and responses" title="Ask the Clergy" description="Bring honest ministry and theological questions. Published answers are offered with care by experienced clergy."><p style={{ marginTop: 26 }}><Link className="button" href="/ask-the-clergy/ask">Ask a question</Link></p></PageIntro>
    <ResourceFilters filters={[{ name: "q", label: "Search answers", type: "search", placeholder: "Search questions" }, { name: "category", label: "Category", options: categories }, { name: "topic", label: "Topic", options: topics }]} />
    {featured ? <div className="dark-panel" style={{ marginBottom: 36 }}><p className="eyebrow">Featured answer</p><h2 style={{ margin: "0 0 16px", fontFamily: "var(--heading-font)", fontSize: "clamp(2.3rem, 4vw, 4rem)", fontWeight: 500, letterSpacing: "-.055em", lineHeight: .98 }}>{featured.shortQuestion}</h2><p style={{ maxWidth: 700 }}>{featured.excerpt}</p><Link className="button--secondary" href={`/ask-the-clergy/${featured.slug}`}>Read the response</Link></div> : null}
    {remaining.length ? <div className="resource-grid">{remaining.map((question) => <ResourceCard key={question.id} resource={toQuestionResource(question)} showImage={false} />)}</div> : <div className="empty-state"><h2>No answers found</h2><p>Try a different phrase or explore the featured response.</p></div>}
  </div></section>;
}
