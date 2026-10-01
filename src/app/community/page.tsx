import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Community", description: "Stay connected to thoughtful resources and gatherings for faithful ministry.", alternates: { canonical: "/community" } };

export default async function CommunityPage() {
  const community = await contentRepository.getCommunityOffering();
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="The Complete Clergyman Community" title={community.title} description={community.description}><p style={{ marginTop: 26 }}><Link className="button" href="/join">Join the community</Link></p></PageIntro><div className="grid-4">{community.benefits.map((benefit, index) => <article className="surface-panel" key={benefit.title}><p className="eyebrow">0{index + 1}</p><h2 style={{ margin: "0 0 10px", fontFamily: "var(--heading-font)", fontSize: "1.7rem", fontWeight: 500 }}>{benefit.title}</h2><p style={{ margin: 0, color: "var(--muted)" }}>{benefit.description}</p></article>)}</div><div className="dark-panel" style={{ marginTop: 72 }}><p className="eyebrow">Public resources remain public</p><h2 style={{ margin: "0 0 12px", fontFamily: "var(--heading-font)", fontSize: "clamp(2.1rem, 4vw, 3.7rem)", fontWeight: 500, letterSpacing: "-.05em", lineHeight: 1 }}>An account is helpful, not a gate.</h2><p style={{ maxWidth: 690 }}>Read articles, browse books, listen to conversations, and use the public resource library without signing in. Accounts will eventually add a book library, registrations, and preferences.</p></div></div></section>;
}
