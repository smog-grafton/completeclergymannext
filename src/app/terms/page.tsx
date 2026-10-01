import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page/PageIntro";
import { RichText } from "@/components/page/RichText";
import { contentRepository } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await contentRepository.getSitePageBySlug("terms");
  return page ? { title: page.seo.title ?? page.title, description: page.seo.description ?? page.description } : { title: "Terms" };
}

export default async function TermsPage() {
  const page = await contentRepository.getSitePageBySlug("terms");
  if (!page) notFound();
  return <section className="page"><div className="reading-width legal-copy"><PageIntro eyebrow="Organisation" title={page.title} description={page.description} /><RichText blocks={page.body} /></div></section>;
}
