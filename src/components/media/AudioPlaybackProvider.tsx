"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { accountFetch } from "@/lib/accountApi";
import styles from "./media-player.module.css";

export interface AudioTrack {
  sourceId?: number;
  src: string;
  sourceType?: string | null;
  title: string;
  artist?: string;
  artwork?: string;
  durationSeconds?: number | null;
  onEnded?: () => void;
}

interface AudioState {
  active?: AudioTrack;
  playing: boolean;
  buffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  error?: string;
}

interface AudioContextValue extends AudioState {
  play: (track: AudioTrack) => Promise<void>;
  pause: () => void;
  toggle: (track?: AudioTrack) => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
}

const AudioPlaybackContext = createContext<AudioContextValue | null>(null);

function isHls(track?: AudioTrack): boolean {
  return track?.sourceType === "hls" || /\.m3u8(?:$|[?#])/i.test(track?.src ?? "");
}

function durationLabel(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remaining = safe % 60;
  return `${hours ? `${hours}:` : ""}${String(minutes).padStart(hours ? 2 : 1, "0")}:${String(remaining).padStart(2, "0")}`;
}

export function useAudioPlayback(): AudioContextValue {
  const context = useContext(AudioPlaybackContext);
  if (!context) throw new Error("Audio playback must be used inside MediaPlaybackProvider.");
  return context;
}

export function MediaPlaybackProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const progressTimer = useRef(0);
  const [state, setState] = useState<AudioState>({ playing: false, buffering: false, currentTime: 0, duration: 0, volume: 1, muted: false, playbackRate: 1 });

  const reportProgress = useCallback((final = false) => {
    const audio = audioRef.current;
    const track = state.active;
    if (!audio || !track?.sourceId || (!final && audio.currentTime - progressTimer.current < 15)) return;
    progressTimer.current = audio.currentTime;
    void accountFetch(`/media/${track.sourceId}/progress`, {
      method: "PUT",
      body: JSON.stringify({ positionSeconds: audio.currentTime, durationSeconds: Number.isFinite(audio.duration) ? audio.duration : track.durationSeconds, completed: final || (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration * .95) }),
    }).catch(() => undefined);
  }, [state.active]);

  const destroyHls = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
  }, []);

  const connectSource = useCallback(async (track: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    destroyHls();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    if (isHls(track)) {
      const { default: Hls } = await import("hls.js");
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(track.src);
        hls.attachMedia(audio);
        hlsRef.current = hls;
      } else {
        audio.src = track.src;
      }
    } else {
      audio.src = track.src;
    }
    audio.playbackRate = state.playbackRate;
    audio.volume = state.volume;
    audio.muted = state.muted;
  }, [destroyHls, state.muted, state.playbackRate, state.volume]);

  const play = useCallback(async (track: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (state.active?.src !== track.src) {
        setState((previous) => ({ ...previous, active: track, currentTime: 0, duration: track.durationSeconds ?? 0, buffering: true, error: undefined }));
        await connectSource(track);
      }
      await audio.play();
    } catch {
      setState((previous) => ({ ...previous, playing: false, buffering: false, error: "This audio could not be played. Please try again." }));
    }
  }, [connectSource, state.active?.src]);

  const pause = useCallback(() => {
    reportProgress(true);
    audioRef.current?.pause();
  }, [reportProgress]);
  const seek = useCallback((seconds: number) => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min(seconds, Number.isFinite(audioRef.current.duration) ? audioRef.current.duration : seconds)); }, []);
  const skip = useCallback((seconds: number) => seek((audioRef.current?.currentTime ?? 0) + seconds), [seek]);
  const setVolume = useCallback((volume: number) => { const next = Math.max(0, Math.min(1, volume)); if (audioRef.current) audioRef.current.volume = next; setState((previous) => ({ ...previous, volume: next, muted: next === 0 })); }, []);
  const setMuted = useCallback((muted: boolean) => { if (audioRef.current) audioRef.current.muted = muted; setState((previous) => ({ ...previous, muted })); }, []);
  const setPlaybackRate = useCallback((playbackRate: number) => { if (audioRef.current) audioRef.current.playbackRate = playbackRate; setState((previous) => ({ ...previous, playbackRate })); }, []);
  const toggle = useCallback((track?: AudioTrack) => {
    if (track && state.active?.src !== track.src) { void play(track); return; }
    if (audioRef.current?.paused) { if (state.active) void play(state.active); } else pause();
  }, [pause, play, state.active]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => setState((previous) => ({ ...previous, currentTime: audio.currentTime, duration: Number.isFinite(audio.duration) ? audio.duration : previous.duration }));
    const onPlay = () => setState((previous) => ({ ...previous, playing: true, buffering: false }));
    const onPause = () => { reportProgress(true); setState((previous) => ({ ...previous, playing: false })); };
    const onWaiting = () => setState((previous) => ({ ...previous, buffering: true }));
    const onCanPlay = () => setState((previous) => ({ ...previous, buffering: false }));
    const onEnded = () => { reportProgress(true); state.active?.onEnded?.(); setState((previous) => ({ ...previous, playing: false, currentTime: 0 })); };
    const onError = () => setState((previous) => ({ ...previous, playing: false, buffering: false, error: "This audio source is unavailable." }));
    audio.addEventListener("timeupdate", update); audio.addEventListener("loadedmetadata", update); audio.addEventListener("play", onPlay); audio.addEventListener("pause", onPause); audio.addEventListener("waiting", onWaiting); audio.addEventListener("canplay", onCanPlay); audio.addEventListener("ended", onEnded); audio.addEventListener("error", onError);
    return () => { audio.removeEventListener("timeupdate", update); audio.removeEventListener("loadedmetadata", update); audio.removeEventListener("play", onPlay); audio.removeEventListener("pause", onPause); audio.removeEventListener("waiting", onWaiting); audio.removeEventListener("canplay", onCanPlay); audio.removeEventListener("ended", onEnded); audio.removeEventListener("error", onError); };
  }, [reportProgress, state.active]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !state.active) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: state.active.title, artist: state.active.artist, artwork: state.active.artwork ? [{ src: state.active.artwork, sizes: "512x512" }] : [] });
    navigator.mediaSession.playbackState = state.playing ? "playing" : "paused";
    const handlers: Array<[MediaSessionAction, () => void]> = [["play", () => { if (state.active) void play(state.active); }], ["pause", pause], ["seekbackward", () => skip(-10)], ["seekforward", () => skip(10)]];
    handlers.forEach(([action, handler]) => { try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* Browser does not expose this action. */ } });
    return () => handlers.forEach(([action]) => { try { navigator.mediaSession.setActionHandler(action, null); } catch { /* no-op */ } });
  }, [pause, play, skip, state.active, state.playing]);

  useEffect(() => () => destroyHls(), [destroyHls]);

  const value = useMemo<AudioContextValue>(() => ({ ...state, play, pause, toggle, seek, skip, setVolume, setMuted, setPlaybackRate }), [pause, play, seek, setMuted, setPlaybackRate, setVolume, skip, state, toggle]);
  return <AudioPlaybackContext.Provider value={value}>{children}<audio ref={audioRef} preload="metadata" className={styles.screenReaderMedia} />{state.active ? <aside className={styles.miniPlayer} aria-label="Now playing"><button type="button" className={styles.iconButton} onClick={() => toggle()} aria-label={state.playing ? "Pause audio" : "Play audio"}>{state.playing ? "Ⅱ" : "▶"}</button><div className={styles.miniCopy}><strong>{state.active.title}</strong><span>{state.active.artist ?? "Complete Clergyman"}</span></div><span className={styles.miniTime}>{durationLabel(state.currentTime)} / {durationLabel(state.duration)}</span><button type="button" className={styles.iconButton} onClick={() => skip(-10)} aria-label="Back 10 seconds">↶10</button><button type="button" className={styles.iconButton} onClick={() => skip(10)} aria-label="Forward 10 seconds">10↷</button></aside> : null}</AudioPlaybackContext.Provider>;
}
