"use client";

import { CustomAudioPlayer } from "@/components/media";

export interface AudioPlayerProps {
  title?: string;
  src?: string | null;
  duration?: number | string | null;
  className?: string;
  onComplete?: () => void;
  sourceId?: number;
  artist?: string;
}

function seconds(value?: number | string | null): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (!value) return undefined;
  const parts = value.split(":").map(Number);
  return parts.some(Number.isNaN) ? undefined : parts.reduce((total, part) => total * 60 + part, 0);
}

/** A visual player never simulates playback: it renders only for a real source. */
export function AudioPlayer({ title = "Audio edition", src, duration, className, onComplete, sourceId, artist }: AudioPlayerProps) {
  void onComplete;
  if (!src) return null;
  return <CustomAudioPlayer sourceId={sourceId} src={src} title={title} artist={artist} durationSeconds={seconds(duration)} className={className} />;
}
