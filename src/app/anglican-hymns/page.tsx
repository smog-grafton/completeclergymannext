import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { MediaPlaybackGate } from "@/components/media";
import { contentRepository } from "@/lib/data";
import { firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Anglican hymns", description: "Listen to and download Anglican hymns from Complete Clergyman." };

export default async function AnglicanHymnsPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const hymns = await contentRepository.getHymns({ query: firstParam(params.q), page: Number(firstParam(params.page) ?? 1), perPage: 24 });
  return <section className="page"><div className="content-width"><PageIntro eyebrow="Anglican worship" title="Anglican hymns" description="A managed collection of hymns to listen to online or save for offline listening. Audio availability and downloads are set by the editor." />
    <ResourceFilters filters={[{ name: "q", label: "Find a hymn", type: "search", placeholder: "Number, title, or tune" }]} />
    <div style={{ borderTop: "2px solid var(--ink)" }}>{hymns.data.map((hymn) => <article className="resource-row" key={hymn.id}><p className="resource-row__type">{hymn.number ? `No. ${hymn.number}` : "Hymn"}</p><div><h2 style={{ fontSize: "1.38rem" }}>{hymn.title}</h2><p>{[hymn.tune, hymn.composer].filter(Boolean).join(" · ") || hymn.description}</p>{hymn.hasMedia ? <MediaPlaybackGate compact manifestEndpoint={`/hymns/${encodeURIComponent(hymn.slug)}`} title={hymn.title} artist={hymn.tune || hymn.composer} kind="audio" /> : <p className="field-help">Audio will be added soon.</p>}</div></article>)}</div>
    {!hymns.data.length ? <div className="empty-state"><h2>No hymns match this search.</h2><p>Try a hymn number, title, or tune name.</p></div> : null}
    {hymns.meta.totalPages > 1 ? <p style={{ marginTop: 30 }}>{hymns.meta.page < hymns.meta.totalPages ? <Link className="button--secondary" href={`/anglican-hymns?page=${hymns.meta.page + 1}`}>More hymns →</Link> : null}</p> : null}
  </div></section>;
}
