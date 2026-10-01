import type { Metadata } from "next";
import { JoinSubscriptionForm } from "@/components/page/JoinSubscriptionForm";
import { PageIntro } from "@/components/page/PageIntro";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Join the community" };

export default async function JoinPage() {
  const community = await contentRepository.getCommunityOffering();
  return <section className="page page--muted"><div className="content-width" style={{ maxWidth: 900 }}><PageIntro eyebrow="Community" title="Stay close to the work" description={community.description} /><div className="surface-panel"><JoinSubscriptionForm labels={community.signupLabels} /></div></div></section>;
}
