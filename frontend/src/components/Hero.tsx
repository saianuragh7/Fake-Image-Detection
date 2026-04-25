import { MouseEvent, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import { ArrowRight, BadgeCheck, Play, Radar, ShieldCheck, Upload, Zap } from "lucide-react"

const portraitUrl =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=90"

const particles = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 37) % 86)}%`,
  top: `${10 + ((index * 29) % 78)}%`,
  size: 2 + (index % 4),
  delay: (index % 7) * 0.35,
  duration: 6 + (index % 5),
}))

const intel = [
  { label: "Deepfake trace", value: "0.018" },
  { label: "GAN residue", value: "LOCKED" },
  { label: "Sensor noise", value: "MATCH" },
]

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function Hero() {
  const portraitRef = useRef<HTMLDivElement | null>(null)
  const [mask, setMask] = useState({ x: 58, y: 48 })
  const prefersReducedMotion = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 90, damping: 24, mass: 0.45 })
  const smoothY = useSpring(mouseY, { stiffness: 90, damping: 24, mass: 0.45 })
  const portraitRotateX = useTransform(smoothY, [-1, 1], [7, -7])
  const portraitRotateY = useTransform(smoothX, [-1, 1], [-9, 9])
  const auraX = useTransform(smoothX, [-1, 1], [-28, 28])
  const auraY = useTransform(smoothY, [-1, 1], [-18, 18])

  const robotMask = useMemo(
    () => `radial-gradient(circle at ${mask.x}% ${mask.y}%, #000 0 21%, rgba(0,0,0,.78) 32%, transparent 48%)`,
    [mask.x, mask.y],
  )

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    setMask({
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y)),
    })

    mouseX.set((x - 50) / 50)
    mouseY.set((y - 50) / 50)
  }

  const resetMotion = () => {
    setMask({ x: 58, y: 48 })
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen w-full scroll-mt-28 items-center overflow-hidden bg-[#050816] px-5 py-28 text-white sm:px-8 lg:px-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_82%_30%,rgba(139,92,246,0.18),transparent_34%),linear-gradient(180deg,#050816_0%,#0b1120_48%,#050816_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(6,182,212,.22),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-[linear-gradient(0deg,#050816,transparent)]" />

      {!prefersReducedMotion
        ? particles.map((particle) => (
            <motion.span
              key={particle.id}
              aria-hidden
              className="absolute rounded-full bg-cyan-200/70 shadow-[0_0_18px_rgba(34,211,238,.75)]"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
              }}
              animate={{ y: [-12, 14, -12], opacity: [0.18, 0.72, 0.18], scale: [0.8, 1.25, 0.8] }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))
        : null}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.055] px-3 py-2 shadow-[0_0_40px_rgba(6,182,212,.12)] backdrop-blur-2xl">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-300/12 text-cyan-200 ring-1 ring-cyan-200/25">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
              Neural image forensics
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.12, ease: "easeOut" }}
            className="mt-8 max-w-4xl text-[clamp(3.1rem,9vw,8.8rem)] font-black uppercase leading-[0.82] tracking-normal text-white"
          >
            Don&apos;t Believe Every Pixel
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24, ease: "easeOut" }}
            className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg lg:mx-0"
          >
            Detect manipulated, AI-generated, and fake images using advanced deep learning intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.34, ease: "easeOut" }}
            className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <button
              type="button"
              onClick={() => scrollToId("try-it")}
              className="group relative inline-flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-full border border-cyan-200/35 bg-cyan-200/10 px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_70px_rgba(6,182,212,.22)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/70 hover:bg-cyan-100/18"
            >
              <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.22),transparent)] opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100" />
              <Upload className="h-4 w-4 text-cyan-100" />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => scrollToId("model")}
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.055] px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-slate-100 shadow-[0_18px_70px_rgba(0,0,0,.24)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-white/10"
            >
              <Play className="h-4 w-4 fill-white/80 text-white/80" />
              Live Demo
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.44, ease: "easeOut" }}
            className="mt-9 hidden gap-3 sm:grid sm:grid-cols-3"
          >
            {intel.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl"
              >
                <div className="text-[0.68rem] uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
                <div className="mt-2 text-sm font-semibold text-cyan-100">{item.value}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.82, delay: 0.16, ease: "easeOut" }}
          className="order-first relative mx-auto w-full max-w-[335px] sm:max-w-[560px] lg:order-none lg:max-w-[620px]"
        >
          <motion.div
            aria-hidden
            style={{ x: auraX, y: auraY }}
            className="absolute inset-[-16%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.38)_0%,rgba(139,92,246,.22)_38%,transparent_70%)] blur-3xl"
          />
          <div className="absolute inset-x-[14%] top-[2%] h-[42%] rounded-full bg-cyan-200/20 blur-3xl" />

          <motion.div
            ref={portraitRef}
            style={{ rotateX: portraitRotateX, rotateY: portraitRotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetMotion}
            className="group relative aspect-[0.86] overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.055] p-3 shadow-[0_42px_160px_rgba(0,0,0,.52),0_0_80px_rgba(6,182,212,.18)] backdrop-blur-2xl sm:rounded-[2.5rem]"
          >
            <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,.22),transparent_28%,rgba(34,211,238,.18)_70%,rgba(139,92,246,.24))] opacity-75" />
            <div className="relative h-full overflow-hidden rounded-[1.35rem] bg-[#050816] sm:rounded-[2rem]">
              <img
                src={portraitUrl}
                alt="Human face being analyzed for AI manipulation"
                className="absolute inset-0 h-full w-full object-cover saturate-[0.92]"
                draggable={false}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,22,.34),transparent_45%,rgba(6,182,212,.12)),radial-gradient(circle_at_50%_28%,transparent_0%,rgba(5,8,22,.15)_46%,rgba(5,8,22,.82)_100%)]" />

              <div
                aria-hidden
                className="absolute inset-0 opacity-95"
                style={{
                  WebkitMaskImage: robotMask,
                  maskImage: robotMask,
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,22,.1)_0%,rgba(13,24,45,.62)_42%,rgba(6,182,212,.36)_100%)] mix-blend-color" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0_18%,rgba(255,255,255,.16)_18%_19%,transparent_19%_32%,rgba(34,211,238,.22)_32%_33%,transparent_33%_48%,rgba(139,92,246,.2)_48%_49%,transparent_49%)]" />
                <div className="absolute right-[10%] top-[18%] h-[62%] w-[44%] rounded-l-[45%] border-l border-cyan-200/45 bg-[repeating-linear-gradient(0deg,rgba(34,211,238,.22)_0_1px,transparent_1px_9px)] shadow-[inset_28px_0_60px_rgba(6,182,212,.18)]" />
                <div className="absolute right-[28%] top-[34%] h-4 w-16 rounded-full bg-cyan-100 shadow-[0_0_28px_rgba(34,211,238,.98),0_0_70px_rgba(139,92,246,.55)]" />
                <div className="absolute right-[19%] top-[50%] h-[1px] w-[38%] bg-cyan-200/75 shadow-[0_0_20px_rgba(34,211,238,.85)]" />
                <div className="absolute right-[24%] top-[62%] h-[1px] w-[32%] bg-violet-300/70" />
              </div>

              <motion.div
                aria-hidden
                className="absolute inset-x-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(34,211,238,.36),transparent)] opacity-80 mix-blend-screen"
                animate={prefersReducedMotion ? undefined : { y: ["-18%", "118%"] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,.055)_0_1px,transparent_1px_5px)] opacity-25" />
              <div className="absolute left-5 top-5 rounded-2xl border border-cyan-200/20 bg-[#050816]/55 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  <Radar className="h-4 w-4" />
                  Scan live
                </div>
              </div>
              <div className="absolute bottom-5 right-5 rounded-2xl border border-white/12 bg-[#050816]/60 px-4 py-3 text-right backdrop-blur-xl">
                <div className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-400">Authenticity</div>
                <div className="mt-1 flex items-center justify-end gap-2 text-sm font-semibold text-cyan-100">
                  <Zap className="h-4 w-4" />
                  Neural verdict
                </div>
              </div>
            </div>
          </motion.div>

          <div className="pointer-events-none absolute -right-2 top-12 hidden w-44 rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_24px_70px_rgba(0,0,0,.32)] backdrop-blur-2xl sm:block">
            <BadgeCheck className="h-5 w-5 text-cyan-200" />
            <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Vision model</div>
            <div className="mt-1 text-2xl font-bold text-white">99ms</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
