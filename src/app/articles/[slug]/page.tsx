import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioPlayer, AuthorMeta, ResourceCard } from "@/components/editorial";
import { JsonLd } from "@/components/page/JsonLd";
import { RichText } from "@/components/page/RichText";
import { toArticleResource, toEditorialAuthor } from "@/components/page/adapters";
import { contentRepository } from "@/lib/data";
import { dateLabel, languageLabel } from "@/lib/route-utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await contentRepository.getArticleBySlug((await params).slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.seo.title ?? article.title,
    description: article.seo.description ?? article.excerpt,
    alternates: { canonical: article.seo.canonicalPath ?? `/articles/${article.slug}` },
    openGraph: { images: article.coverImage.url ? [{ url: article.coverImage.url, alt: article.coverImage.alt }] : [] },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await contentRepository.getArticleBySlug((await params).slug);
  if (!article) notFound();
  const related = await contentRepository.getRelatedArticles(article.id, 3);

  return (
    <article className="page">
      <div className="content-width">
        <header className="reading-width" style={{ paddingBottom: 38 }}>
          <p className="eyebrow">Article · {article.category.name}</p>
          <h1 className="detail-title">{article.title}</h1>
          {article.subtitle ? <p className="detail-subtitle">{article.subtitle}</p> : null}
          <AuthorMeta author={toEditorialAuthor(article.author)} publishedAt={article.publishedAt} readingTime={article.readingTimeMinutes} />
          <div className="metadata" style={{ marginTop: 18 }}><span>{languageLabel(article.language)}</span><span>{dateLabel(article.publishedAt)}</span><span>{article.topics.map((topic) => topic.name).join(", ")}</span></div>
        </header>
        <figure style={{ margin: "0 auto 48px", width: "min(1020px, var(--content-width))" }}>
          <Image src={article.coverImage.url} alt={article.coverImage.alt} width={article.coverImage.width} height={article.coverImage.height} sizes="(max-width: 1020px) 100vw, 1020px" style={{ width: "100%", height: "auto", display: "block" }} priority />
        </figure>
        <div className="reading-width">
          {article.audio ? <AudioPlayer title={`Listen to ${article.title}`} src={article.audio.url} duration={article.audio.durationSeconds} /> : null}
          <div className="prose" style={{ marginTop: article.audio ? 42 : 0 }}><RichText blocks={article.body} className="" /></div>
          <div className="rule" />
          <div className="surface-panel">
            <p className="eyebrow">About the author</p>
            <h2 style={{ margin: "0 0 10px", fontFamily: "var(--heading-font)", fontSize: "2rem", fontWeight: 500 }}>{article.author.name}</h2>
            <p style={{ margin: 0, color: "var(--ink-soft)" }}>{article.author.shortBio}</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 26 }}>
            {article.pdfUrl ? <a className="button--secondary" href={article.pdfUrl}>View original PDF</a> : null}
            {article.pdfUrl ? <a className="button--quiet" href={article.pdfUrl} download>Download PDF →</a> : null}
            <Link className="button--quiet" href={`/search?q=${encodeURIComponent(article.title)}`}>Share this article →</Link>
          </div>
        </div>
        {related.length ? (
          <section style={{ marginTop: 90 }}>
            <div className="section-heading"><h2>Continue reading</h2><Link href="/articles">All articles →</Link></div>
            <div className="resource-grid">{related.map((item) => <ResourceCard key={item.id} resource={toArticleResource(item)} />)}</div>
          </section>
        ) : null}
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.excerpt, datePublished: article.publishedAt, image: article.coverImage.url, author: { "@type": "Person", name: article.author.name }, publisher: { "@type": "Organization", name: "The Complete Clergyman" } }} />
    </article>
  );
}
