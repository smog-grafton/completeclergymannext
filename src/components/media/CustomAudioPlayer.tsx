"use client";

import { useId } from "react";
import { useAudioPlayback, type AudioTrack } from "./AudioPlaybackProvider";
import styles from "./media-player.module.css";

interface Props extends AudioTrack {
  className?: string;
  compact?: boolean;
  onEnded?: () => void;
}

function label(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hour = Math.floor(safe / 3600);
  const minute = Math.floor((safe % 3600) / 60);
  const second = safe % 60;
  return `${hour ? `${hour}:` : ""}${String(minute).padStart(hour ? 2 : 1, "0")}:${String(second).padStart(2, "0")}`;
}

export function CustomAudioPlayer({ className, compact = false, ...track }: Props) {
  const audio = useAudioPlayback();
  const inputId = useId();
  const active = audio.active?.src === track.src;
  const currentTime = active ? audio.currentTime : 0;
  const duration = active ? audio.duration : track.durationSeconds ?? 0;
  const classes = [styles.audioPlayer, compact ? styles.audioCompact : "", className].filter(Boolean).join(" ");

  return <section className={classes} aria-label={`Audio player: ${track.title}`}>
    <button className={styles.playButton} type="button" onClick={() => audio.toggle(track)} aria-label={active && audio.playing ? `Pause ${track.title}` : `Play ${track.title}`}>{active && audio.playing ? "Ⅱ" : "▶"}</button>
    <div className={styles.audioBody}>
      <div className={styles.audioMeta}><strong>{track.title}</strong>{track.artist ? <span>{track.artist}</span> : null}</div>
      <input id={inputId} className={styles.range} type="range" min="0" max={duration || 1} value={Math.min(currentTime, duration || 1)} step="0.1" onChange={(event) => { if (!active) void audio.play(track); audio.seek(Number(event.target.value)); }} aria-label="Audio progress" />
      <div className={styles.timeRow}><span>{label(currentTime)}</span>{audio.buffering && active ? <span>Buffering…</span> : <span>{label(duration)}</span>}</div>
    </div>
    {!compact ? <div className={styles.audioActions}>
      <button type="button" className={styles.textButton} onClick={() => audio.skip(-10)} aria-label="Back 10 seconds">↶ 10</button>
      <button type="button" className={styles.textButton} onClick={() => audio.skip(10)} aria-label="Forward 10 seconds">10 ↷</button>
      <button type="button" className={styles.textButton} onClick={() => audio.setMuted(!audio.muted)} aria-label={audio.muted ? "Unmute" : "Mute"}>{audio.muted ? "Unmute" : "Mute"}</button>
      <select className={styles.speedSelect} value={audio.playbackRate} onChange={(event) => audio.setPlaybackRate(Number(event.target.value))} aria-label="Playback speed"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select>
    </div> : null}
    {active && audio.error ? <p className={styles.error} role="alert">{audio.error}</p> : null}
  </section>;
}
