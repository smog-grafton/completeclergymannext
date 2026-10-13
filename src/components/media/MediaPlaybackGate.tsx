"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { accountJson } from "@/lib/accountApi";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import { CustomVideoPlayer } from "./CustomVideoPlayer";
import type { MediaEndpointPayload, PlaybackManifest, PlaybackSource } from "./types";
import styles from "./media-player.module.css";

interface Props {
  manifestEndpoint?: string;
  sourceId?: number;
  title: string;
  artwork?: string;
  artist?: string;
  kind: "audio" | "video";
  compact?: boolean;
  className?: string;
  onManifest?: (payload: MediaEndpointPayload["data"]) => React.ReactNode;
  onAudioEnded?: () => void;
}

function providerUrl(source: PlaybackSource): string | null {
  if (source.provider === "youtube" && source.providerId) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(source.providerId)}?rel=0&modestbranding=1`;
  if (source.provider === "vimeo" && source.providerId) return `https://player.vimeo.com/video/${encodeURIComponent(source.providerId)}?dnt=1`;
  return source.embedUrl ?? null;
}

export function MediaPlaybackGate({ manifestEndpoint, sourceId, title, artwork, artist, kind, compact = false, className, onManifest, onAudioEnded }: Props) {
  const [manifest, setManifest] = useState<PlaybackManifest | null>(null);
  const [content, setContent] = useState<MediaEndpointPayload["data"]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const payload = sourceId
          ? await accountJson<{ data: PlaybackManifest }>(`/media/${sourceId}`)
          : await accountJson<MediaEndpointPayload>(manifestEndpoint!);
        const contentData = sourceId ? undefined : (payload as MediaEndpointPayload).data;
        const initial = sourceId ? (payload as { data: PlaybackManifest }).data : contentData?.media;
        if (!initial) throw new Error("This resource does not have a playback source yet.");
        let resolved = initial;
        if (initial.primarySourceId) {
          const source = await accountJson<{ data: PlaybackManifest }>(`/media/${initial.primarySourceId}`);
          resolved = source.data;
        }
        if (!cancelled) { setContent(contentData); setManifest(resolved); }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "The media could not be opened.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [manifestEndpoint, sourceId]);

  const classes = [styles.gate, className].filter(Boolean).join(" ");
  if (loading) return <section className={classes} aria-busy="true"><div className={styles.skeleton} /><p>Preparing secure playback…</p></section>;
  if (error) return <section className={classes}><p className={styles.error} role="alert">{error}</p></section>;
  if (!manifest || !manifest.canPlay) return <section className={`${classes} ${styles.locked}`}><p className={styles.lockEyebrow}>Playback locked</p><h2>{manifest?.requiresAuthentication ? "Sign in to continue" : "Access is required"}</h2><p>{manifest?.reason ?? "This media is not available right now."}</p><div className={styles.lockActions}><Link className="button" href={`/login?next=${encodeURIComponent(typeof window === "undefined" ? "/" : window.location.pathname)}`}>Sign in</Link><Link className="button--secondary" href="/subscriptions">View memberships</Link></div>{onManifest?.(content)}</section>;
  const source = manifest.sources.find((entry) => entry.id === manifest.primarySourceId) ?? manifest.sources[0];
  if (!source) return <section className={classes}><p className={styles.error}>No usable playback source is available.</p></section>;
  const provider = providerUrl(source);
  if (provider) return <section className={classes}><div className={styles.providerShell}><iframe title={`${title} player`} src={provider} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen loading="lazy" /></div><p className={styles.providerNote}>Playback is provided by {source.provider === "youtube" ? "YouTube" : source.provider === "vimeo" ? "Vimeo" : "the media provider"}.</p></section>;
  const src = source.streamUrl ?? source.url;
  if (!src) return <section className={classes}><p className={styles.error}>This media source cannot be delivered securely.</p></section>;
  return <section className={classes}>{kind === "audio" ? <CustomAudioPlayer compact={compact} sourceId={source.id} src={src} sourceType={source.type} title={title} artist={artist} artwork={artwork} durationSeconds={source.durationSeconds ?? manifest.durationSeconds} onEnded={onAudioEnded} /> : <CustomVideoPlayer sourceId={source.id} src={src} sourceType={source.type} title={title} poster={artwork} durationSeconds={source.durationSeconds ?? manifest.durationSeconds} tracks={manifest.tracks} />}{manifest.canDownload && source.isDownloadable ? <a className={styles.downloadLink} href={src} download>Download this media</a> : null}</section>;
}
