"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { accountFetch } from "@/lib/accountApi";
import type { MediaTrack } from "./types";
import styles from "./media-player.module.css";

interface Props {
  sourceId?: number;
  src: string;
  sourceType?: string | null;
  title: string;
  poster?: string;
  durationSeconds?: number | null;
  tracks?: MediaTrack[];
}

function format(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hour = Math.floor(safe / 3600);
  const minute = Math.floor((safe % 3600) / 60);
  return `${hour ? `${hour}:` : ""}${String(minute).padStart(hour ? 2 : 1, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function CustomVideoPlayer({ sourceId, src, sourceType, title, poster, durationSeconds, tracks = [] }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void; currentLevel: number; levels: Array<{ height?: number }> } | null>(null);
  const progressRef = useRef(0);
  const progressId = useId();
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [qualities, setQualities] = useState<Array<{ value: number; label: string }>>([]);
  const [quality, setQuality] = useState(-1);
  const [caption, setCaption] = useState("off");
  const [error, setError] = useState("");
  const isHls = sourceType === "hls" || /\.m3u8(?:$|[?#])/i.test(src);

  const reportProgress = useCallback((final = false) => {
    const video = videoRef.current;
    if (!video || !sourceId || (!final && video.currentTime - progressRef.current < 15)) return;
    progressRef.current = video.currentTime;
    void accountFetch(`/media/${sourceId}/progress`, { method: "PUT", body: JSON.stringify({ positionSeconds: video.currentTime, durationSeconds: Number.isFinite(video.duration) ? video.duration : durationSeconds, completed: final || (Number.isFinite(video.duration) && video.currentTime >= video.duration * .95) }) }).catch(() => undefined);
  }, [durationSeconds, sourceId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let alive = true;
    const setSource = async () => {
      hlsRef.current?.destroy(); hlsRef.current = null;
      setError(""); setCurrentTime(0); setDuration(durationSeconds ?? 0);
      if (isHls) {
        const { default: Hls } = await import("hls.js");
        if (!alive) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true });
          hls.loadSource(src); hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => { if (alive) setQualities(hls.levels.map((level, index) => ({ value: index, label: level.height ? `${level.height}p` : `Quality ${index + 1}` }))); });
          hlsRef.current = hls;
        } else video.src = src;
      } else video.src = src;
    };
    void setSource();
    return () => { alive = false; hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [durationSeconds, isHls, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => { setCurrentTime(video.currentTime); if (Number.isFinite(video.duration)) setDuration(video.duration); };
    const onPause = () => { reportProgress(true); setPlaying(false); };
    const onEnded = () => { reportProgress(true); setPlaying(false); };
    const onError = () => { setError("This video source is unavailable."); setPlaying(false); setBuffering(false); };
    video.addEventListener("timeupdate", update); video.addEventListener("loadedmetadata", update); video.addEventListener("play", () => setPlaying(true)); video.addEventListener("pause", onPause); video.addEventListener("waiting", () => setBuffering(true)); video.addEventListener("canplay", () => setBuffering(false)); video.addEventListener("ended", onEnded); video.addEventListener("error", onError);
    return () => { video.removeEventListener("timeupdate", update); video.removeEventListener("loadedmetadata", update); video.removeEventListener("pause", onPause); video.removeEventListener("ended", onEnded); video.removeEventListener("error", onError); };
  }, [reportProgress]);

  const toggle = () => { const video = videoRef.current; if (!video) return; if (video.paused) void video.play().catch(() => setError("The browser blocked playback. Use the play button again.")); else video.pause(); };
  const seek = (time: number) => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, Math.min(time, duration || time)); };
  const changeQuality = (next: number) => { setQuality(next); if (hlsRef.current) hlsRef.current.currentLevel = next; };
  const updateCaption = (value: string) => { setCaption(value); const textTracks = videoRef.current?.textTracks; if (!textTracks) return; Array.from(textTracks).forEach((track, index) => { track.mode = String(index) === value ? "showing" : "disabled"; }); };
  const fullscreen = () => { const shell = shellRef.current; if (!shell) return; if (document.fullscreenElement) void document.exitFullscreen(); else void shell.requestFullscreen?.(); };
  const pictureInPicture = () => { const video = videoRef.current; if (video && document.pictureInPictureEnabled) void (document.pictureInPictureElement ? document.exitPictureInPicture() : video.requestPictureInPicture()); };
  const keyboard = (event: React.KeyboardEvent<HTMLDivElement>) => { if ((event.target as HTMLElement).matches("input, select, button")) return; if ([" ", "k"].includes(event.key)) { event.preventDefault(); toggle(); } if (event.key === "ArrowLeft") seek(currentTime - 5); if (event.key === "ArrowRight") seek(currentTime + 5); if (event.key === "m") { const next = !muted; setMuted(next); if (videoRef.current) videoRef.current.muted = next; } if (event.key === "f") fullscreen(); };

  return <section ref={shellRef} className={styles.videoPlayer} aria-label={`Video player: ${title}`} tabIndex={0} onKeyDown={keyboard}>
    <video ref={videoRef} className={styles.videoElement} poster={poster} preload="metadata" playsInline onClick={toggle}>{tracks.filter((track) => track.url).map((track) => <track key={track.id} src={track.url!} kind={track.kind} label={track.label} srcLang={track.language ?? undefined} default={track.isDefault} />)}</video>
    <div className={styles.videoOverlay} aria-hidden="true">{buffering ? <span>Loading…</span> : null}</div>
    <div className={styles.videoControls}>
      <div className={styles.progressRow}><input id={progressId} className={styles.range} type="range" min="0" max={duration || 1} value={Math.min(currentTime, duration || 1)} step=".1" onChange={(event) => seek(Number(event.target.value))} aria-label="Video progress" /><span>{format(currentTime)} / {format(duration)}</span></div>
      <div className={styles.controlRow}>
        <button className={styles.playButton} type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"}>{playing ? "Ⅱ" : "▶"}</button>
        <button className={styles.textButton} type="button" onClick={() => seek(currentTime - 10)}>↶ 10</button><button className={styles.textButton} type="button" onClick={() => seek(currentTime + 10)}>10 ↷</button>
        <button className={styles.textButton} type="button" onClick={() => { const next = !muted; setMuted(next); if (videoRef.current) videoRef.current.muted = next; }}>{muted ? "Unmute" : "Mute"}</button>
        <input className={styles.volumeRange} type="range" min="0" max="1" step=".05" value={volume} aria-label="Volume" onChange={(event) => { const next = Number(event.target.value); setVolume(next); if (videoRef.current) videoRef.current.volume = next; }} />
        <span className={styles.controlSpacer} />
        {qualities.length ? <select className={styles.speedSelect} value={quality} onChange={(event) => changeQuality(Number(event.target.value))} aria-label="Video quality"><option value={-1}>Auto</option>{qualities.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select> : null}
        {tracks.length ? <select className={styles.speedSelect} value={caption} onChange={(event) => updateCaption(event.target.value)} aria-label="Captions"><option value="off">Captions off</option>{tracks.map((track, index) => <option key={track.id} value={index}>{track.label}</option>)}</select> : null}
        <select className={styles.speedSelect} value={speed} onChange={(event) => { const next = Number(event.target.value); setSpeed(next); if (videoRef.current) videoRef.current.playbackRate = next; }} aria-label="Playback speed"><option value=".75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select>
        <button className={styles.iconButton} type="button" onClick={pictureInPicture} aria-label="Picture in picture">▣</button><button className={styles.iconButton} type="button" onClick={fullscreen} aria-label="Fullscreen">⛶</button>
      </div>
    </div>
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
  </section>;
}
