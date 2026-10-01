import Image from "next/image";
import Link from "next/link";

import { mediaAlt, mediaUrl, type EditorialAuthor } from "./editorial-types";
import styles from "./editorial.module.css";

export interface AuthorMetaProps {
  author?: EditorialAuthor | null;
  publishedAt?: string | null;
  readingTime?: number | null;
  className?: string;
  compact?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function AuthorMeta({
  author,
  publishedAt,
  readingTime,
  className,
  compact = false,
}: AuthorMetaProps) {
  const date = formatDate(publishedAt);
  const avatar = mediaUrl(author?.portrait ?? author?.photo ?? author?.avatar);
  const name = author?.name;
  const meta = [date, readingTime ? String(readingTime) + " min read" : null]
    .filter(Boolean)
    .join(" · ");
  const classes = [styles.authorMeta, compact ? styles.authorMetaCompact : "", className]
    .filter(Boolean)
    .join(" ");

  if (!author && !meta) return null;

  return (
    <div className={classes}>
      {author ? (
        <div className={styles.authorIdentity}>
          {avatar ? (
            <Image
              className={styles.authorImage}
              src={avatar}
              alt={mediaAlt(author?.portrait ?? author?.photo ?? author?.avatar, name ? "Portrait of " + name : "")}
              width={compact ? 30 : 42}
              height={compact ? 30 : 42}
            />
          ) : (
            <span className={styles.authorFallback} aria-hidden="true">
              {name ? initials(name) : "CC"}
            </span>
          )}
          <span className={styles.authorCopy}>
            {author.slug ? (
              <Link className={styles.authorName} href={"/authors/" + author.slug}>
                {name}
              </Link>
            ) : (
              <span className={styles.authorName}>{name}</span>
            )}
            {author.role && !compact ? (
              <span className={styles.authorRole}>{author.role}</span>
            ) : null}
          </span>
        </div>
      ) : null}
      {meta ? <span className={styles.authorDate}>{meta}</span> : null}
    </div>
  );
}
