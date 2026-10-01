import type { Metadata } from "next";
import Link from "next/link";
import { ResourceCard } from "@/components/editorial";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { toMessageResource } from "@/components/page/adapters";
import { contentRepository } from "@/lib/data";
import { firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Messages", description: "Timely ministry reflections and approved community submissions.", alternates: { canonical: "/messages" } };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const [themes, allMessages, result] = await Promise.all([
    contentRepository.getThemes(),
    contentRepository.getMessages({ perPage: 100 }),
    contentRepository.getMessages({ query: firstParam(params.q), theme: firstParam(params.theme), topic: firstParam(params.topic), language: firstParam(params.language) as "en" | "lg" | "sw" | undefined, perPage: 48 }),
  ]);
  const topicOptions = [...new Map(allMessages.data.flatMap((message) => message.topics.map((topic) => [topic.slug, topic.name] as const))).entries()].map(([value, label]) => ({ value, label }));

  return (
    <section className="page">
      <div className="content-width">
        <PageIntro eyebrow="Monthly ministry themes" title="Messages" description="Practical reflections from clergy, ministry leaders, and the Complete Clergyman community.">
          <p style={{ marginTop: 26 }}><Link className="button" href="/messages/submit">Submit an article</Link></p>
        </PageIntro>
        <ResourceFilters filters={[
          { name: "q", label: "Search", type: "search", placeholder: "Search messages" },
          { name: "theme", label: "Monthly theme", options: themes.map((theme) => ({ value: theme.slug, label: theme.title })) },
          { name: "topic", label: "Topic", options: topicOptions },
          { name: "language", label: "Language", options: [{ value: "en", label: "English" }, { value: "lg", label: "Luganda" }, { value: "sw", label: "Swahili" }] },
        ]} />
        {result.data.length ? <div className="resource-grid">{result.data.map((message) => <ResourceCard key={message.id} resource={toMessageResource(message)} />)}</div> : <div className="empty-state"><h2>No messages found</h2><p>Try adjusting your theme, language, or search phrase.</p></div>}
      </div>
    </section>
  );
}
