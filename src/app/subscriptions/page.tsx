import type { Metadata } from "next";
import { PageIntro } from "@/components/page/PageIntro";
import { SubscriptionPlans } from "@/components/page/SubscriptionPlans";

export const metadata: Metadata = { title: "Membership", description: "Member-library access for ongoing ministry formation." };

export default function SubscriptionsPage() {
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Ongoing formation" title="Membership" description="Choose a membership for continuing access to the member library. A one-time purchase remains in your library permanently; membership access follows your active subscription." /><SubscriptionPlans /></div></section>;
}
