"use client";

import { useEffect, useId, useRef, useState } from "react";

import styles from "./editorial.module.css";

export interface AudioPlayerProps {
  title?: string;
  src?: string | null;
  duration?: number | string | null;
  className?: string;
  onComplete?: () => void;
}

function durationInSeconds(value?: number | string | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const sections = value.split(":").map(Number);
  if (sections.some(Number.isNaN)) return 0;
  return sections.reduce((total, section) => total * 60 + section, 0);
}

function formatDuration(value: number) {
  const safe = Math.max(0, Math.round(value));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const minuteText = hours ? String(minutes).padStart(2, "0") : String(minutes);
  return (hours ? String(hours) + ":" : "") + minuteText + ":" + String(seconds).padStart(2, "0");
}

export function AudioPlayer({
  title = "Audio edition",
  src,
  duration,
  className,
  onComplete,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fallbackDuration = durationInSeconds(duration) || 60 * 18;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [knownDuration, setKnownDuration] = useState(fallbackDuration);
  const [speed, setSpeed] = useState(1);
  const [isSimulated, setIsSimulated] = useState(!src);
  const timerRef = useRef<number | null>(null);
  const progressId = useId();
  const canUseMedia = Boolean(src) && !isSimulated;

  useEffect(() => {
    setCurrentTime(0);
    setKnownDuration(fallbackDuration);
    setIsPlaying(false);
    setIsSimulated(!src);
  }, [src, fallbackDuration]);

  useEffect(() => {
    if (!isPlaying || canUseMedia) return;

    timerRef.current = window.setInterval(() => {
      setCurrentTime((previous) => {
        const next = previous + 0.25 * speed;
        if (next >= knownDuration) {
          window.clearInterval(timerRef.current ?? undefined);
          setIsPlaying(false);
          onComplete?.();
          return knownDuration;
        }
        return next;
      });
    }, 250);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [canUseMedia, isPlaying, knownDuration, onComplete, speed]);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || isSimulated) {
      setIsPlaying((previous) => !previous);
      return;
    }

    if (audio.paused) {
      void audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Phase-one URLs deliberately stand in for backend media. A failed
          // source remains usable as a local, visual playback demonstration.
          setIsSimulated(true);
          setIsPlaying(true);
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  function handleSeek(value: number) {
    const nextTime = Math.min(Math.max(value, 0), knownDuration);
    setCurrentTime(nextTime);
    if (audioRef.current && !isSimulated) audioRef.current.currentTime = nextTime;
  }

  function handleSpeed() {
    const next = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  const classes = [styles.audioPlayer, className].filter(Boolean).join(" ");

  return (
    <section className={classes} aria-label={"Audio player: " + title}>
      {src ? (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onLoadedMetadata={(event) => {
            if (Number.isFinite(event.currentTarget.duration)) {
              setKnownDuration(event.currentTarget.duration);
            }
          }}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            onComplete?.();
          }}
          onError={() => setIsSimulated(true)}
        />
      ) : null}
      <button
        className={styles.audioPlay}
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause " + title : "Play " + title}
      >
        <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
      </button>
      <div className={styles.audioTrack}>
        <p className={styles.audioTitle}>{title}</p>
        <input
          id={progressId}
          className={styles.audioRange}
          type="range"
          min="0"
          max={knownDuration || 1}
          value={Math.min(currentTime, knownDuration || 1)}
          step="0.1"
          onChange={(event) => handleSeek(Number(event.target.value))}
          aria-label="Audio progress"
        />
        <div className={styles.audioTime}>
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(knownDuration)}</span>
        </div>
      </div>
      <button className={styles.audioSpeed} type="button" onClick={handleSpeed}>
        {speed}×
      </button>
    </section>
  );
}
