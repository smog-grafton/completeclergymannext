import type { Metadata } from "next";
import { GiveForm } from "@/components/page/GiveForm";
import { PageIntro } from "@/components/page/PageIntro";
import { contentRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Give", description: "Support the work of making faithful ministry resources widely available.", alternates: { canonical: "/give" } };

export default async function GivePage() {
  const campaign = await contentRepository.getDonationCampaign();
  return <section className="page page--muted"><div className="content-width" style={{ maxWidth: 930 }}><PageIntro eyebrow="Give" title={campaign.title} description={campaign.description} /><GiveForm suggestedAmounts={campaign.suggestedAmounts} currency={campaign.defaultCurrency} /><p className="field-help" style={{ marginTop: 20 }}>Your gift is confirmed only after a secure, server-side verification with the selected provider.</p></div></section>;
}
