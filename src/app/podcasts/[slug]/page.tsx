import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/page/JsonLd";
import { RichText } from "@/components/page/RichText";
import { contentRepository } from "@/lib/data";
import { dateLabel, durationLabel } from "@/lib/route-utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const podcast = await contentRepository.getPodcastBySlug((await params).slug);
  return podcast ? { title: podcast.seo.title ?? podcast.title, description: podcast.seo.description ?? podcast.description } : { title: "Podcast not found" };
}

function youtubeEmbedUrl(videoId: string, url: string) {
  if (videoId) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const id = host === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : undefined;
  } catch {
    return undefined;
  }
}

export default async function PodcastDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const podcast = await contentRepository.getPodcastBySlug((await params).slug);
  if (!podcast) notFound();

  const directMediaUrl = podcast.mediaUrl;
  const youtubeEmbed = podcast.sourceType === "youtube" ? youtubeEmbedUrl(podcast.youtubeVideoId, podcast.youtubeUrl) : undefined;
  const trailerUrl = podcast.trailerUrl;
  const playerStyle = { width: "100%", marginTop: 32, borderRadius: 2, background: "#171717" } as const;
  const player = podcast.sourceType === "embed" && podcast.embedUrl ? (
    <iframe title={`${podcast.title} player`} src={podcast.embedUrl} style={{ ...playerStyle, minHeight: 360, border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
  ) : youtubeEmbed ? (
    <iframe title={`${podcast.title} on YouTube`} src={youtubeEmbed} style={{ ...playerStyle, aspectRatio: "16 / 9", border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
  ) : directMediaUrl && podcast.episodeFormat === "video" ? (
    <video controls preload="metadata" poster={podcast.artwork.url} style={playerStyle}><source src={directMediaUrl} />Your browser does not support embedded video.</video>
  ) : directMediaUrl ? (
    <audio controls preload="metadata" style={{ ...playerStyle, padding: 12 }}><source src={directMediaUrl} />Your browser does not support embedded audio.</audio>
  ) : null;
  const sourceUrl = directMediaUrl ?? podcast.youtubeUrl ?? podcast.embedUrl;

  return <article className="page"><div className="content-width"><div className="two-column-detail"><aside className="sticky-column"><Image src={podcast.artwork.url} alt={podcast.artwork.alt} width={podcast.artwork.width} height={podcast.artwork.height} sizes="(max-width: 767px) 100vw, 34vw" style={{ width: "100%", height: "auto", display: "block" }} /><div className="surface-panel" style={{ marginTop: 18 }}><p className="eyebrow">Episode {podcast.episodeNumber}</p><p style={{ margin: 0 }}>{durationLabel(podcast.durationSeconds)} · {dateLabel(podcast.publishedAt)}</p></div></aside><div><p className="eyebrow">{podcast.showTitle}</p><h1 className="detail-title">{podcast.title}</h1><p className="detail-subtitle">{podcast.description}</p><div className="metadata"><span>Hosted by {podcast.host.name}</span>{podcast.guestName ? <span>With {podcast.guestName}</span> : null}<span>{durationLabel(podcast.durationSeconds)}</span></div>{player ?? (sourceUrl ? <div style={{ marginTop: 32 }}><a className="button--secondary" href={sourceUrl} target="_blank" rel="noreferrer">Open episode media ↗</a></div> : <p className="notice" style={{ marginTop: 32 }}>Episode media will appear here once an editor selects an uploaded file, direct URL, YouTube URL, or embed URL in the podcast record.</p>)}{trailerUrl ? <p style={{ marginTop: 16 }}><a className="text-link" href={trailerUrl} target="_blank" rel="noreferrer">Open trailer ↗</a></p> : null}<div className="rule" /><p className="eyebrow">Episode notes</p><RichText blocks={podcast.showNotes} /><div className="surface-panel" style={{ marginTop: 42 }}><p className="eyebrow">Share this episode</p><p style={{ margin: 0 }}>Copy or open this episode link on another device: <a className="text-link" href={podcast.qrDestination}>{podcast.qrDestination}</a>.</p></div><p style={{ marginTop: 34 }}><Link className="text-link" href="/podcasts">All episodes →</Link></p></div></div></div><JsonLd data={{ "@context": "https://schema.org", "@type": "PodcastEpisode", name: podcast.title, description: podcast.description, datePublished: podcast.publishedAt, duration: "PT" + Math.round(podcast.durationSeconds / 60) + "M", image: podcast.artwork.url, url: podcast.qrDestination, associatedMedia: sourceUrl }} /></article>;
}
