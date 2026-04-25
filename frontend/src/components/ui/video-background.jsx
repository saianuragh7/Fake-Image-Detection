import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function VideoBackground({ className }) {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Directly use the Shutterstock preview MP4 link matching the user's requested video ID
  const SHUTTERSTOCK_MP4 = "https://www.shutterstock.com/shutterstock/videos/3529545287/preview/stock-footage-video.mp4";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={cn("relative w-full z-10 -mt-[150px] pointer-events-none", className)}
    >
      {/* Video layer */}
      <video
        ref={videoRef}
        className="w-full h-auto object-cover mix-blend-screen"
        src={SHUTTERSTOCK_MP4}
        autoPlay={true}
        muted={true}
        loop={true}
        playsInline={true}
        crossOrigin="anonymous"
        onCanPlay={() => setIsLoaded(true)}
        onLoadedData={() => setIsLoaded(true)}
      />
      
      {/* Cinematic Gradient Overlays to blend it smoothly into the page bg */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-[#05050A] via-transparent to-[#05050A]" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-[#010101] via-transparent to-[#010101]" />
    </motion.div>
  );
}
