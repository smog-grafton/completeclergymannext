import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorMeta } from "@/components/editorial";
import { JsonLd } from "@/components/page/JsonLd";
import { RichText } from "@/components/page/RichText";
import { toEditorialAuthor } from "@/components/page/adapters";
import { contentRepository } from "@/lib/data";
import { dateLabel } from "@/lib/route-utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const answer = await contentRepository.getClergyQuestionBySlug((await params).slug);
  return answer ? { title: answer.shortQuestion, description: answer.excerpt } : { title: "Answer not found" };
}

export default async function ClergyAnswerPage({ params }: { params: Promise<{ slug: string }> }) {
  const answer = await contentRepository.getClergyQuestionBySlug((await params).slug);
  if (!answer) notFound();
  return <article className="page"><div className="reading-width"><p className="eyebrow">Ask the Clergy · {answer.category.name}</p><h1 className="detail-title">{answer.shortQuestion}</h1><p className="detail-subtitle">Asked by a reader from {answer.submittedCountry}.</p>{answer.answeredBy ? <AuthorMeta author={toEditorialAuthor(answer.answeredBy)} publishedAt={answer.publishedAt} /> : null}<div className="rule" /><div className="prose"><RichText blocks={answer.answer} className="" /></div>{answer.video ? <p style={{ marginTop: 32 }}><a className="button--secondary" href={answer.video.url} target="_blank" rel="noreferrer">Watch the video response ↗</a></p> : null}<p style={{ marginTop: 42 }}><Link className="text-link" href="/ask-the-clergy/ask">Ask your own question →</Link></p></div><JsonLd data={{ "@context": "https://schema.org", "@type": "Question", name: answer.question, text: answer.excerpt, dateCreated: answer.askedAt, acceptedAnswer: { "@type": "Answer", text: answer.excerpt, dateCreated: answer.publishedAt ? dateLabel(answer.publishedAt) : undefined, author: answer.answeredBy ? { "@type": "Person", name: answer.answeredBy.name } : undefined } }} /></article>;
}
