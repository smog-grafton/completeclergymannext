export type MediaSourceType = "upload" | "remote_url" | "fetch_url" | "youtube" | "vimeo" | "hls" | "embed";

export interface MediaTrack {
  id: number;
  kind: "subtitles" | "captions" | "chapters" | string;
  label: string;
  language?: string | null;
  isDefault?: boolean;
  url?: string | null;
}

export interface PlaybackSource {
  id: number;
  type: MediaSourceType;
  provider?: "youtube" | "vimeo" | string | null;
  providerId?: string | null;
  label?: string | null;
  quality?: string | null;
  mimeType?: string | null;
  container?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  isPreview?: boolean;
  isDownloadable?: boolean;
  streamUrl?: string | null;
  embedUrl?: string | null;
  url?: string | null;
}

export interface PlaybackManifest {
  contentId: number;
  contentType: string;
  canPlay: boolean;
  canDownload: boolean;
  locked: boolean;
  accessType: string;
  requiresAuthentication: boolean;
  reason?: string | null;
  primarySourceId?: number | null;
  durationSeconds?: number | null;
  sources: PlaybackSource[];
  tracks: MediaTrack[];
}

export interface MediaEndpointPayload {
  data?: { media?: PlaybackManifest; accessType?: string; price?: number | string | null; currency?: string | null };
}
