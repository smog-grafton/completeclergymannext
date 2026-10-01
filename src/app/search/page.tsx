import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { contentRepository } from "@/lib/data";
import { dateLabel, firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Search", description: "Search the Complete Clergyman resource library.", alternates: { canonical: "/search" } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const q = firstParam(params.q)?.trim() ?? "";
  const selectedType = firstParam(params.type);
  const resources = q ? await contentRepository.searchResources(q, { types: selectedType ? [selectedType as never] : undefined, limit: 60 }) : [];
  const types = ["article", "message", "book", "podcast", "clergy-answer", "event"];

  return (
    <section className="page">
      <div className="content-width">
        <PageIntro eyebrow="Resource library" title="Search" description="Search articles, messages, books, podcasts, answered questions, and events." />
        <form className="filter-bar search-filter" action="/search" method="get">
          <div className="form-field"><label className="field-label" htmlFor="search-q">Search resources</label><input className="field" id="search-q" name="q" type="search" defaultValue={q} placeholder="Prayer, leadership, preaching, calling…" autoFocus /></div>
          <div className="form-field"><label className="field-label" htmlFor="search-type">Type</label><select className="field" id="search-type" name="type" defaultValue={selectedType ?? ""}><option value="">All types</option>{types.map((type) => <option key={type} value={type}>{type.replaceAll("-", " ")}</option>)}</select></div>
          <button className="button" type="submit">Search</button>
        </form>
        {q ? (
          resources.length ? <div className="resource-row" style={{ borderTop: "1px solid var(--border)" }}><div className="resource-row__type">{resources.length} results</div><div><h2>Results for “{q}”</h2></div></div> : <div className="empty-state"><h2>No resources match “{q}”.</h2><p>Try a broader term such as prayer, leadership, preaching, calling, or pastoral care.</p></div>
        ) : <div className="notice">Start with a title, topic, ministry concern, or a person’s name.</div>}
        {resources.map((resource) => <article className="resource-row" key={`${resource.type}-${resource.id}`}><p className="resource-row__type">{resource.type.replaceAll("-", " ")}</p><div><h2><Link href={resource.href}>{resource.title}</Link></h2><p>{resource.excerpt}</p><div className="metadata" style={{ marginTop: 10 }}>{resource.authorName ? <span>{resource.authorName}</span> : null}{resource.publishedAt ? <span>{dateLabel(resource.publishedAt)}</span> : null}</div></div><Link className="text-link" href={resource.href}>Open →</Link></article>)}
      </div>
    </section>
  );
}
