import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/page/JsonLd";
import { PodcastPlaybackGate } from "@/components/page/PodcastPlaybackGate";
import { RichText } from "@/components/page/RichText";
import { contentRepository } from "@/lib/data";
import { dateLabel, durationLabel } from "@/lib/route-utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const podcast = await contentRepository.getPodcastBySlug((await params).slug);
  return podcast ? { title: podcast.seo.title ?? podcast.title, description: podcast.seo.description ?? podcast.description } : { title: "Podcast not found" };
}

export default async function PodcastDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const podcast = await contentRepository.getPodcastBySlug((await params).slug);
  if (!podcast) notFound();
  const trailerUrl = podcast.trailerUrl;
  return <article className="page"><div className="content-width"><div className="two-column-detail"><aside className="sticky-column"><Image src={podcast.artwork.url} alt={podcast.artwork.alt} width={podcast.artwork.width} height={podcast.artwork.height} sizes="(max-width: 767px) 100vw, 34vw" style={{ width: "100%", height: "auto", display: "block" }} /><div className="surface-panel" style={{ marginTop: 18 }}><p className="eyebrow">Episode {podcast.episodeNumber}</p><p style={{ margin: 0 }}>{durationLabel(podcast.durationSeconds)} · {dateLabel(podcast.publishedAt)}</p></div></aside><div><p className="eyebrow">{podcast.showTitle}</p><h1 className="detail-title">{podcast.title}</h1><p className="detail-subtitle">{podcast.description}</p><div className="metadata"><span>Hosted by {podcast.host.name}</span>{podcast.guestName ? <span>With {podcast.guestName}</span> : null}<span>{durationLabel(podcast.durationSeconds)}</span></div>{podcast.hasMedia ? <PodcastPlaybackGate slug={podcast.slug} title={podcast.title} artwork={podcast.artwork.url} format={podcast.episodeFormat === "video" ? "video" : "audio"} /> : <p className="field-help" style={{ marginTop: 28 }}>Playback will be available once an editor adds a media source.</p>}{trailerUrl ? <p style={{ marginTop: 16 }}><a className="text-link" href={trailerUrl} target="_blank" rel="noreferrer">Open trailer ↗</a></p> : null}<div className="rule" /><p className="eyebrow">Episode notes</p><RichText blocks={podcast.showNotes} /><div className="surface-panel" style={{ marginTop: 42 }}><p className="eyebrow">Share this episode</p><p style={{ margin: 0 }}>Copy or open this episode link on another device: <a className="text-link" href={podcast.qrDestination}>{podcast.qrDestination}</a>.</p></div><p style={{ marginTop: 34 }}><Link className="text-link" href="/podcasts">All episodes →</Link></p></div></div></div><JsonLd data={{ "@context": "https://schema.org", "@type": "PodcastEpisode", name: podcast.title, description: podcast.description, datePublished: podcast.publishedAt, duration: "PT" + Math.round(podcast.durationSeconds / 60) + "M", image: podcast.artwork.url, url: podcast.qrDestination }} /></article>;
}
