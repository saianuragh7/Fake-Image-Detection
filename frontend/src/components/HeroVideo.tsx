import { useEffect, useRef } from "react";

const VIDEO_SRC =
  "https://cdn.pixabay.com/video/2020/07/30/45360-446225028_large.mp4";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = VIDEO_SRC;
    video.play().catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <video
        ref={videoRef}
        muted
        autoPlay
        loop
        playsInline
        className="w-full h-full object-cover"
        style={{ mixBlendMode: "screen" }}
      />
      {/* Dark overlay to dim the video */}
      <div className="absolute inset-0 bg-[#010101]/60" />
    </div>
  );
}
