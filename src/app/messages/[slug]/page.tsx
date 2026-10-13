import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorMeta } from "@/components/editorial";
import { MediaPlaybackGate } from "@/components/media";
import { JsonLd } from "@/components/page/JsonLd";
import { RichText } from "@/components/page/RichText";
import { toEditorialAuthor } from "@/components/page/adapters";
import { contentRepository } from "@/lib/data";
import { dateLabel, languageLabel } from "@/lib/route-utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const message = await contentRepository.getMessageBySlug((await params).slug);
  return message ? { title: message.seo.title ?? message.title, description: message.seo.description ?? message.excerpt } : { title: "Message not found" };
}

export default async function MessageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const message = await contentRepository.getMessageBySlug((await params).slug);
  if (!message) notFound();
  return (
    <article className="page">
      <div className="content-width">
        <header className="reading-width" style={{ paddingBottom: 38 }}>
          <p className="eyebrow">{message.kind.replaceAll("-", " ")}</p>
          <h1 className="detail-title">{message.title}</h1>
          <p className="detail-subtitle">{message.excerpt}</p>
          <AuthorMeta author={toEditorialAuthor(message.author)} publishedAt={message.publishedAt} readingTime={message.readingTimeMinutes} />
          <div className="metadata" style={{ marginTop: 18 }}><span>{languageLabel(message.language)}</span><span>{dateLabel(message.publishedAt)}</span>{message.theme ? <span>{message.theme.title}</span> : null}</div>
        </header>
        <figure style={{ margin: "0 auto 48px", width: "min(1020px, var(--content-width))" }}><Image src={message.coverImage.url} alt={message.coverImage.alt} width={message.coverImage.width} height={message.coverImage.height} sizes="(max-width: 1020px) 100vw, 1020px" style={{ width: "100%", height: "auto", display: "block" }} priority /></figure>
        <div className="reading-width">
          {message.hasMedia ? <MediaPlaybackGate manifestEndpoint={`/messages/${encodeURIComponent(message.slug)}`} title={message.title} artwork={message.coverImage.url} artist={message.author.name} kind={message.mediaKind ?? "audio"} /> : null}
          <RichText blocks={message.body} />
          {message.video ? <p style={{ marginTop: 30 }}><a className="button--secondary" href={message.video.url} target="_blank" rel="noreferrer">Watch related video ↗</a></p> : null}
          <p style={{ marginTop: 32 }}><Link className="text-link" href="/messages">More messages →</Link></p>
        </div>
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: message.title, datePublished: message.publishedAt, image: message.coverImage.url, author: { "@type": "Person", name: message.author.name } }} />
    </article>
  );
}
