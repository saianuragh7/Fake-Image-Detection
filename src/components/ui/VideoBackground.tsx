import Hls from 'hls.js'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const HLS_SRC =
  'https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/manifest/video.m3u8'
const MP4_FALLBACK = '/_videos/v1/f0c78f536d5f21a047fb7792723a36f9d647daa1'

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const retryCountRef = useRef(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const attemptPlay = () => {
      void videoEl.play().catch(() => {})
    }

    const setupHls = (src: string) => {
      if (!videoEl) return

      if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = src
        videoEl.load()
        videoEl.addEventListener('loadeddata', () => setIsLoaded(true), { once: true })
        attemptPlay()
        return
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        })

        hls.loadSource(src)
        hls.attachMedia(videoEl)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoaded(true)
          attemptPlay()
        })

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal) return

          if (retryCountRef.current < 1) {
            retryCountRef.current += 1
            hls.destroy()
            hlsRef.current = null
            window.setTimeout(() => setupHls(HLS_SRC), 1500)
            return
          }

          hls.destroy()
          hlsRef.current = null
          videoEl.src = MP4_FALLBACK
          videoEl.load()
          attemptPlay()
        })

        hlsRef.current = hls
        return
      }

      videoEl.src = MP4_FALLBACK
      videoEl.load()
      attemptPlay()
    }

    setupHls(HLS_SRC)

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [])

  return (
    <div className="relative z-10 -mt-[150px] w-full">
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#010101_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#010101_0%,transparent_50%)]" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="pointer-events-none block h-auto w-full select-none object-cover mix-blend-screen"
        />
      </motion.div>
    </div>
  )
}
