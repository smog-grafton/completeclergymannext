import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceCard } from "@/components/editorial";
import { PageIntro } from "@/components/page/PageIntro";
import { toMessageResource } from "@/components/page/adapters";
import { contentRepository } from "@/lib/data";

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const themes = await contentRepository.getThemes();
  const theme = themes.find((item) => item.slug === slug);
  if (!theme) notFound();
  const messages = await contentRepository.getMessages({ theme: slug, perPage: 40 });
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow={theme.eyebrow} title={theme.title} description={theme.description}><p style={{ marginTop: 22 }}><Link className="button" href="/messages/submit">Submit to this theme</Link></p></PageIntro>{messages.data.length ? <div className="resource-grid">{messages.data.map((message) => <ResourceCard key={message.id} resource={toMessageResource(message)} />)}</div> : <div className="empty-state"><h2>Contributions are coming</h2><p>This theme is ready to receive thoughtful submissions.</p></div>}</div></section>;
}
