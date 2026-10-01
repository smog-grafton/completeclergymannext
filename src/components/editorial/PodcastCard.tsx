import Image from "next/image";
import Link from "next/link";

import { mediaAlt, mediaUrl, type EditorialAuthor, type PodcastResource } from "./editorial-types";
import styles from "./editorial.module.css";

export interface PodcastCardProps {
  podcast: PodcastResource;
  href?: string;
  className?: string;
}

export function PodcastCard({ podcast, href, className }: PodcastCardProps) {
  const sourceImage = podcast.artwork ?? podcast.coverImage ?? podcast.image;
  const image = mediaUrl(sourceImage);
  const destination = href ?? podcast.href ?? "/podcasts/" + podcast.slug;
  const classes = [styles.podcastCard, className].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      <Link className={styles.podcastArtwork} href={destination} tabIndex={-1}>
        {image ? (
          <Image
            src={image}
            alt={mediaAlt(sourceImage, podcast.imageAlt ?? "")}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
          />
        ) : (
          <span className={styles.podcastArtworkFallback} aria-hidden="true">
            CC
          </span>
        )}
      </Link>
      <div className={styles.podcastBody}>
        <p className={styles.resourceLabel}>
          {podcast.episodeNumber ? "Episode " + podcast.episodeNumber : "Podcast"}
        </p>
        <h3 className={styles.podcastTitle}>
          <Link href={destination}>{podcast.title}</Link>
        </h3>
        {podcast.excerpt ?? podcast.description ? (
          <p className={styles.podcastExcerpt}>{podcast.excerpt ?? podcast.description}</p>
        ) : null}
        <div className={styles.podcastMeta}>
          {podcast.host ? <span>Hosted by {hostName(podcast.host)}</span> : null}
          {podcast.guest ?? podcast.guestName ? <span>With {podcast.guest ?? podcast.guestName}</span> : null}
          {podcast.duration ?? podcast.durationSeconds ? (
            <span>{podcast.duration ?? formatSeconds(podcast.durationSeconds ?? 0)}</span>
          ) : null}
        </div>
        <Link className={styles.textAction} href={destination}>
          Listen to episode <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function hostName(host: EditorialAuthor | string) {
  return typeof host === "string" ? host : host.name;
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return String(minutes) + ":" + String(remainder).padStart(2, "0");
}
