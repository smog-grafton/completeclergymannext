"use client";

import { MediaPlaybackGate } from "@/components/media";
import { PaymentCheckout } from "@/components/page/PaymentCheckout";

export function PodcastPlaybackGate({ slug, title, artwork, format = "audio" }: { slug: string; title: string; artwork?: string; format?: "audio" | "video" }) {
  return <MediaPlaybackGate
    manifestEndpoint={`/podcasts/${encodeURIComponent(slug)}`}
    title={title}
    artwork={artwork}
    artist="The Complete Clergyman Podcast"
    kind={format}
    onManifest={(content) => ["purchase", "purchase_or_subscription"].includes(content?.accessType ?? "") && Number(content?.price ?? 0) > 0
      ? <div style={{ marginTop: 18 }}><PaymentCheckout kind="podcast" slug={slug} title={title} amount={Number(content?.price)} currency={content?.currency ?? "UGX"} /></div>
      : null}
  />;
}
