import Image from "next/image";
import Link from "next/link";

import { AuthorMeta } from "./AuthorMeta";
import { mediaAlt, mediaUrl, type EditorialResource } from "./editorial-types";
import styles from "./editorial.module.css";

export interface FeaturedStoryProps {
  story: EditorialResource;
  href?: string;
  priority?: boolean;
  className?: string;
}

function getHref(story: EditorialResource) {
  if (story.href) return story.href;
  const kind = story.kind ?? story.type ?? "article";
  if (kind === "answer" || kind === "clergy-answer") return "/ask-the-clergy/" + story.slug;
  return "/" + kind + "s/" + story.slug;
}

/** Keep editorial cards useful when an administrator supplies a full headline or body copy. */
function truncateForFeature(value: string, maximumLength: number): string {
  const normalized = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (normalized.length <= maximumLength) return normalized;

  const candidate = normalized.slice(0, maximumLength + 1);
  const lastWordBoundary = candidate.lastIndexOf(" ");
  const clipped = lastWordBoundary > 0 ? candidate.slice(0, lastWordBoundary) : normalized.slice(0, maximumLength);

  return `${clipped.trimEnd()}…`;
}

export function FeaturedStory({ story, href, priority = false, className }: FeaturedStoryProps) {
  const sourceImage = story.coverImage ?? story.image;
  const image = mediaUrl(sourceImage);
  const destination = href ?? getHref(story);
  const kind = story.kind ?? story.type ?? "article";
  const classes = [styles.featuredStory, className].filter(Boolean).join(" ");
  const title = truncateForFeature(story.title, 92);
  const summary = story.excerpt ?? story.description;

  return (
    <article className={classes}>
      <Link className={styles.featuredMedia} href={destination} tabIndex={-1}>
        {image ? (
          <Image
            src={image}
            alt={mediaAlt(sourceImage, story.imageAlt ?? "")}
            fill
            priority={priority}
            sizes="(max-width: 850px) 100vw, 55vw"
          />
        ) : (
          <span className={styles.featuredPlaceholder} aria-hidden="true">
            {story.title}
          </span>
        )}
      </Link>
      <div className={styles.featuredCopy}>
        <p className={styles.resourceLabel}>{kind}</p>
        <h1 className={styles.featuredTitle}>
          <Link aria-label={story.title} href={destination} title={story.title}>{title}</Link>
        </h1>
        {summary ? (
          <p className={styles.featuredExcerpt}>{truncateForFeature(summary, 130)}</p>
        ) : null}
        <AuthorMeta
          author={story.author ?? story.authors?.[0]}
          publishedAt={story.publishedAt}
          readingTime={story.readingTime ?? story.readingTimeMinutes}
        />
        <Link className={styles.textAction} href={destination}>
          Read {kind} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
