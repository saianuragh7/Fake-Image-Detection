import { useEffect, useRef, useState } from "react";

interface HlsVideoProps {
  /** Primary HLS (.m3u8) source. */
  src: string;
  /** Optional MP4 fallback if HLS fails (codec / network errors). */
  fallbackSrc?: string;
  /** Poster shown until first frame paints. */
  poster?: string;
  className?: string;
}

export function HlsVideo({ src, fallbackSrc, poster, className }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {});
      }
    };

    const useFallback = () => {
      if (!fallbackSrc) return;
      console.warn("[HlsVideo] falling back to MP4 source");
      setUsingFallback(true);
      video.src = fallbackSrc;
      video.load();
      video.addEventListener("loadedmetadata", tryPlay, { once: true });
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari, iOS).
      video.src = src;
      video.addEventListener("loadedmetadata", tryPlay, { once: true });
      video.addEventListener("error", useFallback, { once: true });
    } else if (fallbackSrc) {
      useFallback();
    } else {
      video.src = src;
      video.addEventListener("loadedmetadata", tryPlay, { once: true });
    }
    return undefined;
  }, [src, fallbackSrc]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      data-using-fallback={usingFallback}
    />
  );
}
