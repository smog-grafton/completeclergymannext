import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionSubnav } from "@/components/layout";
import { PageIntro } from "@/components/page/PageIntro";
import { RichText } from "@/components/page/RichText";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "About", description: "Learn about The Complete Clergyman, its purpose, resources, and people.", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const [overview, pages, team] = await Promise.all([contentRepository.getAboutPage("overview"), contentRepository.getAboutPages(), contentRepository.getTeamMembers()]);
  if (!overview) return null;
  const navigation = pages.map((page) => ({ id: page.slug, label: page.slug === "overview" ? "Overview" : (page.eyebrow ?? page.title).replace("Our ", ""), href: page.slug === "overview" ? "/about" : `/about/${page.slug}` }));
  return <><SectionSubnav label="About navigation" items={navigation} sticky /><section className="page"><div className="content-width"><PageIntro eyebrow={overview.eyebrow} title={overview.title} description={overview.description} /><div className="grid-2"><div className="prose"><RichText blocks={overview.body} className="" /></div><aside className="dark-panel"><p className="eyebrow">A shared vocation</p><h2 style={{ margin: "0 0 16px", fontFamily: "var(--heading-font)", fontSize: "2.5rem", fontWeight: 500, letterSpacing: "-.04em", lineHeight: 1 }}>Thoughtful help for the whole work of ministry.</h2><p>Our editorial direction will be kept in the backend so the organisation can refine its own language as the work grows.</p><Link className="button--secondary" href="/about/mission">Our mission →</Link></aside></div><section style={{ marginTop: 90 }}><div className="section-heading"><h2>Our team</h2><Link href="/about/team">Meet the team →</Link></div><div className="grid-4">{team.slice(0, 4).map((member) => <article key={member.id}><Image src={member.photo?.url ?? "/images/logos/logo-cleryman.png"} alt={member.photo?.alt ?? ""} width={member.photo?.width ?? 1774} height={member.photo?.height ?? 887} sizes="(max-width: 767px) 50vw, 25vw" style={{ width: "100%", height: 250, objectFit: "cover", display: "block", marginBottom: 14 }} /><p className="eyebrow">{member.role}</p><h3 style={{ margin: 0, fontFamily: "var(--heading-font)", fontSize: "1.55rem", fontWeight: 500 }}>{member.name}</h3></article>)}</div></section></div></section></>;
}
