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

export function FeaturedStory({ story, href, priority = false, className }: FeaturedStoryProps) {
  const sourceImage = story.coverImage ?? story.image;
  const image = mediaUrl(sourceImage);
  const destination = href ?? getHref(story);
  const kind = story.kind ?? story.type ?? "article";
  const classes = [styles.featuredStory, className].filter(Boolean).join(" ");

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
          <Link href={destination}>{story.title}</Link>
        </h1>
        {story.excerpt ?? story.description ? (
          <p className={styles.featuredExcerpt}>{story.excerpt ?? story.description}</p>
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
