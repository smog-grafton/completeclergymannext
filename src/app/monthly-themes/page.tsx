import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Monthly Themes", description: "Current and past ministry themes from The Complete Clergyman." };

export default async function MonthlyThemesPage() {
  const themes = await contentRepository.getThemes();
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Focused formation" title="Monthly themes" description="A changing collection of teaching, reading, and encouragement for the ordinary work of Christian ministry." />{themes.length ? <div className="grid-3">{themes.map((theme) => <article className="surface-panel" key={theme.id}>{theme.heroImage ? <Image src={theme.heroImage.url} alt={theme.heroImage.alt} width={theme.heroImage.width} height={theme.heroImage.height} sizes="(max-width: 767px) 100vw, 33vw" style={{ display: "block", height: 190, margin: "-26px -26px 22px", objectFit: "cover", width: "calc(100% + 52px)" }} /> : null}<p className="eyebrow">{theme.isCurrent ? "Current theme" : theme.eyebrow}</p><h2 style={{ marginTop: 0 }}>{theme.title}</h2><p>{theme.description}</p><Link className="text-link" href={`/monthly-themes/${theme.slug}`}>Explore this theme →</Link></article>)}</div> : <div className="empty-state"><h2>No monthly themes yet</h2><p>New ministry themes will appear here when they are published.</p></div>}</div></section>;
}
