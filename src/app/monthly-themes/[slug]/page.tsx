import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page/PageIntro";
import { RichText } from "@/components/page/RichText";
import { contentRepository } from "@/lib/data";
import { richTextBlocksFromHtml } from "@/lib/laravelContentRepository";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const theme = await contentRepository.getThemeBySlug((await params).slug);
  return theme ? { title: theme.title, description: theme.description } : { title: "Monthly theme not found" };
}

export default async function MonthlyThemeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const theme = await contentRepository.getThemeBySlug((await params).slug);
  if (!theme) notFound();
  const messages = await contentRepository.getMessages({ theme: theme.slug, perPage: 30 });
  return <section className="page"><div className="content-width"><PageIntro eyebrow={theme.eyebrow} title={theme.title} description={theme.description} />{theme.heroImage ? <Image src={theme.heroImage.url} alt={theme.heroImage.alt} width={theme.heroImage.width} height={theme.heroImage.height} sizes="(max-width: 1180px) 100vw, 1180px" style={{ display: "block", height: "auto", marginBottom: 28, maxHeight: 520, objectFit: "cover", width: "100%" }} /> : null}<div className="surface-panel"><RichText blocks={richTextBlocksFromHtml(theme.introduction)} /></div>{messages.data.length ? <section style={{ marginTop: 48 }}><div className="section-heading"><h2>Resources in this theme</h2><Link href={`/messages?theme=${theme.slug}`}>All messages →</Link></div><div className="resource-grid">{messages.data.map((message) => <article className="surface-panel" key={message.id}><p className="eyebrow">Message</p><h3 style={{ marginTop: 0 }}><Link href={`/messages/${message.slug}`}>{message.title}</Link></h3><p>{message.excerpt}</p></article>)}</div></section> : null}</div></section>;
}
