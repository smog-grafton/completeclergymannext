import type { Metadata } from "next";
import Link from "next/link";
import { PrayerButton } from "@/components/page/PrayerAction";
import { PageIntro } from "@/components/page/PageIntro";
import { ResourceFilters } from "@/components/page/ResourceFilters";
import { contentRepository } from "@/lib/data";
import { dateLabel, firstParam, type RouteSearchParams } from "@/lib/route-utils";

export const metadata: Metadata = { title: "Prayer Wall", description: "A moderated place to carry ministry burdens together in prayer.", alternates: { canonical: "/prayer-wall" } };

function pageHref(page: number, params: RouteSearchParams) {
  const next = new URLSearchParams();
  for (const key of ["q", "country", "category", "sort"]) {
    const value = firstParam(params[key]);
    if (value) next.set(key, value);
  }
  next.set("page", String(page));
  return `/prayer-wall?${next}`;
}

export default async function PrayerWallPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = await searchParams;
  const requestedSort = firstParam(params.sort);
  const filters = { query: firstParam(params.q), country: firstParam(params.country), category: firstParam(params.category), sort: requestedSort === "most-prayed" ? "most-prayed" as const : "newest" as const, page: Number(firstParam(params.page) ?? 1), perPage: 24 };
  const [all, prayers] = await Promise.all([contentRepository.getPrayerRequests({ perPage: 100 }), contentRepository.getPrayerRequests(filters)]);
  const countries = [...new Set(all.data.map((prayer) => prayer.country).filter(Boolean))].sort().map((country) => ({ value: country, label: country }));
  const categories = [...new Set(all.data.map((prayer) => prayer.category).filter((category): category is string => Boolean(category)))].sort().map((category) => ({ value: category, label: category }));

  return <section className="page"><div className="content-width"><PageIntro eyebrow="A shared work of care" title="Prayer Wall" description="Every request is reviewed before it appears here. Explore requests in manageable pages, then carry one need at a time."><p style={{ marginTop: 26 }}><Link className="button" href="/prayer-wall/submit">Share a prayer request</Link></p></PageIntro>
    <ResourceFilters filters={[{ name: "q", label: "Search requests", type: "search", placeholder: "Search by need" }, { name: "category", label: "Category", options: categories }, { name: "country", label: "Country", options: countries }, { name: "sort", label: "Order", options: [{ value: "newest", label: "Newest first" }, { value: "most-prayed", label: "Most prayed for" }] }]} />
    <p className="field-help" style={{ marginBottom: 18 }}>{prayers.meta.total} reviewed request{prayers.meta.total === 1 ? "" : "s"} · Page {prayers.meta.page} of {Math.max(prayers.meta.totalPages, 1)}</p>
    <div style={{ borderTop: "2px solid var(--ink)" }}>{prayers.data.map((prayer) => <article className="resource-row" key={prayer.id}><p className="resource-row__type">{prayer.category ?? "Prayer"}<br /><span style={{ color: "var(--muted)", fontWeight: 400, letterSpacing: 0 }}>{prayer.isAnonymous ? "Anonymous" : prayer.publicDisplayName}{prayer.country ? ` · ${prayer.country}` : ""}</span></p><div><h2 style={{ fontSize: "1.38rem" }}>{prayer.title || "A request for prayer"}</h2><p style={{ color: "var(--ink-soft)", fontSize: "1rem" }}>{prayer.request}</p><div className="metadata" style={{ marginTop: 12 }}><span>{dateLabel(prayer.approvedAt ?? prayer.submittedAt)}</span></div></div><PrayerButton prayerId={prayer.id} initialCount={prayer.prayerCount} /></article>)}</div>
    {!prayers.data.length ? <div className="empty-state"><h2>No prayer requests match this search.</h2><p>Try a more general phrase, or share a request for review.</p></div> : null}
    {prayers.meta.totalPages > 1 ? <nav aria-label="Prayer wall pages" style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 36 }}><span>{prayers.meta.page > 1 ? <Link className="button--secondary" href={pageHref(prayers.meta.page - 1, params)}>← Newer requests</Link> : null}</span><span>{prayers.meta.page < prayers.meta.totalPages ? <Link className="button--secondary" href={pageHref(prayers.meta.page + 1, params)}>Older requests →</Link> : null}</span></nav> : null}
  </div></section>;
}
