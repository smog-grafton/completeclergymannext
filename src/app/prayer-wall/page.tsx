import type { Metadata } from "next";
import Link from "next/link";
import { PrayerButton } from "@/components/page/PrayerAction";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { contentRepository } from "@/lib/data";
import { dateLabel, firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Prayer Wall", description: "A moderated place to carry ministry burdens together in prayer.", alternates: { canonical: "/prayer-wall" } };

export default async function PrayerWallPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const [all, prayers] = await Promise.all([contentRepository.getPrayerRequests({ perPage: 100 }), contentRepository.getPrayerRequests({ query: firstParam(params.q), country: firstParam(params.country), perPage: 48 })]);
  const countries = [...new Set(all.data.map((prayer) => prayer.country))].sort().map((country) => ({ value: country, label: country }));
  return <section className="page"><div className="content-width"><PageIntro eyebrow="A shared work of care" title="Prayer Wall" description="Every request is reviewed before it appears here. Carry a brother or sister in prayer, one need at a time."><p style={{ marginTop: 26 }}><Link className="button" href="/prayer-wall/submit">Share a prayer request</Link></p></PageIntro><ResourceFilters filters={[{ name: "q", label: "Search requests", type: "search", placeholder: "Search by need" }, { name: "country", label: "Country", options: countries }]} />
    <div style={{ borderTop: "2px solid var(--ink)" }}>{prayers.data.map((prayer) => <article className="resource-row" key={prayer.id}><p className="resource-row__type">{prayer.isAnonymous ? "Anonymous" : prayer.publicDisplayName}<br /><span style={{ color: "var(--muted)", fontWeight: 400, letterSpacing: 0 }}>{prayer.district ? `${prayer.district}, ` : ""}{prayer.country}</span></p><div><h2 style={{ fontSize: "1.38rem" }}>A request for prayer</h2><p style={{ color: "var(--ink-soft)", fontSize: "1rem" }}>{prayer.request}</p><div className="metadata" style={{ marginTop: 12 }}><span>{dateLabel(prayer.approvedAt ?? prayer.submittedAt)}</span></div></div><PrayerButton prayerId={prayer.id} initialCount={prayer.prayerCount} /></article>)}</div>
    {!prayers.data.length ? <div className="empty-state"><h2>No prayer requests match this search.</h2><p>Try a more general phrase, or share a request for review.</p></div> : null}
  </div></section>;
}
