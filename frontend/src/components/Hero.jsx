import { useRef } from "react"
import { motion, useAnimationFrame } from "framer-motion"
import { ShieldCheck } from "lucide-react"

function ShinyText({ children, className = "", style = {} }) {
  const textRef = useRef(null)
  const positionRef = useRef(-120)

  useAnimationFrame((_, delta) => {
    positionRef.current += (delta / 3500) * 240

    if (positionRef.current > 120) {
      positionRef.current = -120
    }

    textRef.current?.style.setProperty("--shine-position", `${positionRef.current}%`)
  })

  return (
    <span
      ref={textRef}
      className={className}
      style={{
        ...style,
        display: "inline-block",
        color: "transparent",
        backgroundImage: "linear-gradient(90deg, #D4FF00 0%, #ffffff 35%, #e6930a 65%, #D4FF00 100%)",
        backgroundSize: "220% 100%",
        backgroundPosition: "var(--shine-position, -120%) 0%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  )
}

const stats = [
  { label: "Peak confidence", value: "99.1%" },
  { label: "Synthetic cues traced", value: "48" },
  { label: "Inference latency", value: "118ms" },
]

export default function Hero() {
  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-5 text-sm uppercase tracking-[0.38em] text-white/55"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          FORENSIC MODELING FOR THE IMAGE AGE
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-[#D4FF00]/20 bg-black/30 px-4 py-2 backdrop-blur-xl"
        >
          <ShieldCheck className="h-4 w-4 text-[#D4FF00]" />
          <span className="text-sm text-white/72">Confidence-calibrated AI image verification</span>
        </motion.div>

        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: "easeOut" }}
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(4.5rem, 14vw, 12rem)",
              lineHeight: 0.82,
              letterSpacing: "0.02em",
            }}
            className="text-white"
          >
            DON&apos;T BELIEVE
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: "easeOut" }}
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(4.5rem, 14vw, 12rem)",
              lineHeight: 0.82,
              letterSpacing: "0.02em",
            }}
          >
            <ShinyText>EVERY PIXEL.</ShinyText>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34, ease: "easeOut" }}
          className="mt-8 max-w-2xl text-base leading-8 text-white/72 sm:text-lg"
        >
          PixelTruth inspects frequency residue, calibration drift, and artifact structure so your team can decide
          whether an image is authentic before it moves downstream.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.44, ease: "easeOut" }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <button
            type="button"
            onClick={() => scrollToSection("try-it")}
            className="rounded-full bg-[#D4FF00] px-7 py-3 text-sm font-semibold text-[#05050a] transition hover:scale-[1.02] hover:bg-white"
          >
            Upload &amp; Detect
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("model")}
            className="rounded-full border border-white/12 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:border-[#D4FF00]/40 hover:text-[#D4FF00]"
          >
            See Model Stats
          </button>
        </motion.div>

        <div className="mt-16 flex flex-wrap gap-4 lg:mt-24">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 + index * 0.08, ease: "easeOut" }}
              className="pt-panel rounded-full px-5 py-3"
            >
              <div className="text-xs uppercase tracking-[0.26em] text-white/45" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                {stat.label}
              </div>
              <div className="mt-1 text-2xl text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
