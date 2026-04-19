import Hls, { type ErrorData } from 'hls.js'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const HLS_SOURCE =
  'https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/manifest/video.m3u8'
const MP4_FALLBACK = '/_videos/v1/f0c78f536d5f21a047fb7792723a36f9d647daa1'

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasRetried = useRef(false)
  const hasSwitchedToFallback = useRef(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    const attemptPlay = () => {
      void video.play().catch(() => undefined)
    }

    const switchToMp4Fallback = () => {
      if (hasSwitchedToFallback.current) return
      hasSwitchedToFallback.current = true
      if (hls) {
        hls.destroy()
        hls = null
      }
      video.src = MP4_FALLBACK
      video.load()
      attemptPlay()
    }

    const recoverFromError = () => {
      if (!hasRetried.current) {
        hasRetried.current = true
        if (hls) {
          hls.startLoad()
        } else {
          video.load()
        }
        attemptPlay()
        return
      }
      switchToMp4Fallback()
    }

    const handleHlsError = (event: string, data: ErrorData) => {
      if (event === Hls.Events.ERROR && data.fatal) {
        recoverFromError()
      }
    }

    const handleVideoError = () => {
      recoverFromError()
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = HLS_SOURCE
      video.load()
      attemptPlay()
    } else if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
      })
      hls.loadSource(HLS_SOURCE)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, attemptPlay)
      hls.on(Hls.Events.ERROR, handleHlsError)
    } else {
      switchToMp4Fallback()
    }

    video.addEventListener('error', handleVideoError)

    return () => {
      video.removeEventListener('error', handleVideoError)
      if (hls) {
        hls.destroy()
      }
    }
  }, [])

  return (
    <div className="pointer-events-none relative z-10 -mt-[150px] w-full overflow-hidden">
      <motion.video
        ref={videoRef}
        width={1920}
        height={1080}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        onLoadedData={() => setIsReady(true)}
        className="block h-auto w-full mix-blend-screen object-contain align-bottom"
      >
        <source src={MP4_FALLBACK} type="video/mp4" />
      </motion.video>
      <div className="absolute inset-0 bg-gradient-to-b from-[#010101] via-transparent to-[#010101]" />
    </div>
  )
}
