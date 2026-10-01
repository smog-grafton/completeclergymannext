import type { Metadata } from "next";
import { PodcastCard } from "@/components/editorial";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { toPodcastResource } from "@/components/page/adapters";
import { contentRepository } from "@/lib/data";
import { firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Podcast", description: "Conversations that nurture faithful, sustainable Christian ministry.", alternates: { canonical: "/podcasts" } };

export default async function PodcastsPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const [all, podcasts] = await Promise.all([contentRepository.getPodcasts({ perPage: 50 }), contentRepository.getPodcasts({ query: firstParam(params.q), topic: firstParam(params.topic), perPage: 40 })]);
  const topics = [...new Map(all.data.flatMap((podcast) => podcast.topics.map((topic) => [topic.slug, topic.name] as const))).entries()].map(([value, label]) => ({ value, label }));
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="The Complete Clergyman Podcast" title="Listen together" description="Long-form conversations for people committed to the slow, faithful work of pastoral ministry." /><ResourceFilters filters={[{ name: "q", label: "Search episodes", type: "search", placeholder: "Search episodes" }, { name: "topic", label: "Topic", options: topics }]} />{podcasts.data.length ? <div className="grid-4">{podcasts.data.map((podcast) => <PodcastCard key={podcast.id} podcast={toPodcastResource(podcast)} />)}</div> : <div className="empty-state"><h2>No podcast episodes found</h2><p>Try another topic or search phrase.</p></div>}</div></section>;
}
