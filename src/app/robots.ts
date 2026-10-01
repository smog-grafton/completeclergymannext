import type { MetadataRoute } from "next";
import { contentRepository } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await contentRepository.getSiteConfig();
  const base = site.domain.replace(/\/$/, "");
  return { rules: { userAgent: "*", allow: "/" }, sitemap: base + "/sitemap.xml", host: base };
}
