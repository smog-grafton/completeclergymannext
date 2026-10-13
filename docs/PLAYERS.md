# Playback client

The media UI lives in `src/components/media` and is loaded only by screens that need playback.

- `MediaPlaybackProvider` owns the one persistent audio element, mini player, Media Session controls, resume reporting and HLS audio support.
- `MediaPlaybackGate` starts with the Laravel content endpoint, then resolves `/api/v1/media/{source}` for a safe, short-lived playback manifest.
- `CustomAudioPlayer` and `CustomVideoPlayer` are custom-control surfaces; neither exposes browser `controls` chrome.
- `hls.js` is dynamically imported only for `.m3u8` content. Safari/native HLS remains the fallback.
- YouTube, Vimeo and generic embeds use an explicit provider shell. The provider's player owns the playback surface.

For private media, do not turn the stream response into a blob URL. Laravel returns a short-lived signed range URL, allowing normal seeking and low memory use.

`MediaPlaybackGate` is used for podcast episodes, article/message audio, hymns, book audio, and chapter-level audiobook sources. Keep new integrations on this contract; never add raw media URLs to frontend fixture data.
