import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Features", description: "Special resources for prayer, learning, community, and ministry partnership.", alternates: { canonical: "/features" } };

export default async function FeaturesPage() {
  const features = await contentRepository.getNavigation("features");
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Special resources" title="Ways to take part" description="A few focused places to bring your questions, carry others in prayer, gather, and help make resources available." />
    <div className="grid-2">{features?.items.map((item, index) => <article className={index === 0 ? "dark-panel" : "surface-panel"} key={item.id}><p className="eyebrow">0{index + 1}</p><h2 style={{ margin: "0 0 12px", fontFamily: "var(--heading-font)", fontWeight: 500, fontSize: "clamp(2rem, 3vw, 3rem)", letterSpacing: "-.04em" }}>{item.label}</h2><p>{item.description}</p><Link className={index === 0 ? "button--secondary" : "text-link"} href={item.href}>Explore {item.label} →</Link></article>)}</div>
  </div></section>;
}
