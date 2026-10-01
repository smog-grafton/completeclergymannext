import type { ArticleCategory, Author, MediaAsset, ResourceType, Topic } from "@/types";

/**
 * Shape adapters for editorial components. They deliberately model the
 * public portion of API-facing records, so pages can pass Article, Message,
 * Podcast, or search-result records without presentation components knowing
 * where the data originated.
 */
export type EditorialResourceKind =
  | "article"
  | "message"
  | "podcast"
  | "book"
  | "answer"
  | "clergy-answer"
  | "event"
  | "resource";

export type MediaInput = string | MediaAsset;

export interface EditorialAuthor extends Pick<Author, "name"> {
  id: string | number;
  slug?: string;
  role?: string;
  /** Adapters retained for an external API or an older CMS response. */
  portrait?: MediaInput | null;
  photo?: MediaInput | null;
  avatar?: MediaInput | null;
  shortBio?: string;
  bio?: string;
}

export interface EditorialResource {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string | null;
  description?: string | null;
  coverImage?: MediaInput | null;
  image?: MediaInput | null;
  imageAlt?: string | null;
  kind?: EditorialResourceKind | ResourceType;
  type?: EditorialResourceKind | ResourceType;
  author?: EditorialAuthor | null;
  authors?: EditorialAuthor[];
  authorName?: string | null;
  category?: string | ArticleCategory | null;
  topics?: string[] | Topic[];
  language?: string | null;
  publishedAt?: string | null;
  readingTime?: number | null;
  readingTimeMinutes?: number | null;
  audioUrl?: string | null;
  audioDuration?: string | number | null;
  href?: string;
}

export interface PodcastResource extends EditorialResource {
  kind?: "podcast" | ResourceType;
  artwork?: MediaInput | null;
  episodeNumber?: number | null;
  host?: EditorialAuthor | string | null;
  guest?: string | null;
  guestName?: string | null;
  duration?: string | number | null;
  durationSeconds?: number | null;
  youtubeUrl?: string | null;
}

export function mediaUrl(value?: MediaInput | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.url;
}

export function mediaAlt(value?: MediaInput | null, fallback = "") {
  if (!value || typeof value === "string") return fallback;
  return value.alt || fallback;
}
