import { HlsVideo } from "@/components/HlsVideo";

const PLAYBACK_ID = "4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc";
const HLS_SRC = `https://stream.mux.com/${PLAYBACK_ID}.m3u8`;
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg?width=1920&time=2`;
const FALLBACK_MP4 =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4";

/**
 * Fixed full-viewport background video that persists across tab navigation
 * so the same Mux clip plays behind every page.
 */
export function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <HlsVideo
        src={HLS_SRC}
        fallbackSrc={FALLBACK_MP4}
        poster={POSTER}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Soft global tint so foreground content stays readable */}
      <div className="absolute inset-0 bg-background/55" />
    </div>
  );
}
