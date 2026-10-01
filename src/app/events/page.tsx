import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { contentRepository } from "@/lib/data";
import { firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Events", description: "Gatherings for renewal, formation, and collaboration in ministry.", alternates: { canonical: "/events" } };

function eventDate(value: string) {
  const date = new Date(value);
  return { day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date), month: new Intl.DateTimeFormat("en", { month: "short" }).format(date) };
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const [all, events] = await Promise.all([contentRepository.getEvents({ perPage: 50 }), contentRepository.getEvents({ query: firstParam(params.q), topic: firstParam(params.topic), upcomingOnly: true, perPage: 40 })]);
  const topics = [...new Map(all.data.flatMap((event) => event.topics.map((topic) => [topic.slug, topic.name] as const))).entries()].map(([value, label]) => ({ value, label }));
  return <section className="page"><div className="content-width"><PageIntro eyebrow="Gather in person" title="Upcoming events" description="Conversations, conferences, and focused training that strengthen the work of ministry." /><ResourceFilters filters={[{ name: "q", label: "Search events", type: "search", placeholder: "Search events" }, { name: "topic", label: "Topic", options: topics }]} />
    <div style={{ borderTop: "2px solid var(--ink)" }}>{events.data.map((event) => { const date = eventDate(event.startsAt); return <article className="resource-row event-list-item" key={event.id}><div className="date-block"><strong>{date.day}</strong><span>{date.month}</span></div><div><p className="eyebrow">{event.city}, {event.country}</p><h2><Link href={`/events/${event.slug}`}>{event.title}</Link></h2><p>{event.shortDescription}</p><div className="metadata" style={{ marginTop: 12 }}><span>{event.venue}</span><span>{event.status === "open" ? "Registration open" : event.status}</span></div></div><Link href={`/events/${event.slug}`} className="event-list-item__image"><Image src={event.image.url} alt={event.image.alt} width={event.image.width} height={event.image.height} sizes="180px" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} /></Link></article> })}</div>{!events.data.length ? <div className="empty-state"><h2>No upcoming events found</h2><p>Please check back soon for the next opportunity to gather.</p></div> : null}
  </div></section>;
}
