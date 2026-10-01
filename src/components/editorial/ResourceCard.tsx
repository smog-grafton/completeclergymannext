import Image from "next/image";
import Link from "next/link";

import { AuthorMeta } from "./AuthorMeta";
import { mediaAlt, mediaUrl, type EditorialResource } from "./editorial-types";
import styles from "./editorial.module.css";

export interface ResourceCardProps {
  resource: EditorialResource;
  href?: string;
  variant?: "standard" | "compact" | "horizontal";
  showImage?: boolean;
  className?: string;
}

function resourceKind(resource: EditorialResource) {
  return resource.kind ?? resource.type ?? "resource";
}

function defaultHref(resource: EditorialResource) {
  if (resource.href) return resource.href;
  const kind = resourceKind(resource);
  const base =
    kind === "answer" || kind === "clergy-answer"
      ? "/ask-the-clergy"
      : kind === "event"
        ? "/events"
        : "/" + (kind === "resource" ? "articles" : kind + "s");
  return base + "/" + resource.slug;
}

function label(kind: string) {
  return kind === "answer" || kind === "clergy-answer" ? "Ask the Clergy" : kind;
}

export function ResourceCard({
  resource,
  href,
  variant = "standard",
  showImage = true,
  className,
}: ResourceCardProps) {
  const sourceImage = resource.coverImage ?? resource.image;
  const image = mediaUrl(sourceImage);
  const classes = [
    styles.resourceCard,
    variant === "compact" ? styles.resourceCardCompact : "",
    variant === "horizontal" ? styles.resourceCardHorizontal : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const destination = href ?? defaultHref(resource);
  const author = resource.author ?? resource.authors?.[0];

  return (
    <article className={classes}>
      {showImage && image ? (
        <Link className={styles.resourceMedia} href={destination} tabIndex={-1}>
          <Image
            src={image}
            alt={mediaAlt(sourceImage, resource.imageAlt ?? "")}
            fill
            sizes={
              variant === "horizontal"
                ? "(max-width: 700px) 100vw, 33vw"
                : "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
            }
          />
        </Link>
      ) : null}
      <div className={styles.resourceBody}>
        <p className={styles.resourceLabel}>{label(resourceKind(resource))}</p>
        <h3 className={styles.resourceTitle}>
          <Link href={destination}>{resource.title}</Link>
        </h3>
        {resource.excerpt ?? resource.description ? (
          <p className={styles.resourceExcerpt}>{resource.excerpt ?? resource.description}</p>
        ) : null}
        <AuthorMeta
          author={author}
          publishedAt={resource.publishedAt}
          readingTime={resource.readingTime ?? resource.readingTimeMinutes}
          compact={variant === "compact"}
        />
      </div>
    </article>
  );
}
