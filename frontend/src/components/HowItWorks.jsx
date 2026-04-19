import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Cpu, Radar, ShieldCheck, Upload } from "lucide-react"

const steps = [
  {
    tab: "Upload",
    icon: Upload,
    title: "Evidence enters the pipeline",
    tech: "INTAKE LAYER",
    body: "PixelTruth receives the source frame, compresses it into a calibrated tensor, and preserves the visual fingerprint needed for downstream forensics.",
    points: [
      "Validates format before inference begins",
      "Standardizes image dimensions for stable scoring",
      "Maintains a clean capture path for uploads, URLs, and webcam frames",
    ],
  },
  {
    tab: "Analyze",
    icon: Cpu,
    title: "Spatial and frequency branches inspect it",
    tech: "DUAL-BRANCH MODEL",
    body: "The detector cross-checks macro structure against spectral residue so diffusion patterns, resampling artifacts, and texture hallucinations all contribute to the score.",
    points: [
      "RGB branch tracks semantic inconsistencies",
      "Frequency branch highlights unnatural periodic residue",
      "Calibration keeps confidence honest instead of theatrical",
    ],
  },
  {
    tab: "Detect",
    icon: Radar,
    title: "Artifact signals are measured",
    tech: "SIGNAL TRACE",
    body: "Internal heuristics weight noise regularity, edge burn-in, and compression mismatch to help the classifier decide where the image deviates from natural capture.",
    points: [
      "Measures high-frequency bars and aliasing drift",
      "Surfaces suspicious cues instead of only a binary label",
      "Keeps transitions fast enough for interactive review",
    ],
  },
  {
    tab: "Verdict",
    icon: ShieldCheck,
    title: "The output becomes a usable verdict",
    tech: "CALIBRATED OUTPUT",
    body: "A final confidence report translates raw logits into a decision you can act on, whether you are screening creative assets or verifying a suspicious frame.",
    points: [
      "Returns a clear real-versus-fake verdict",
      "Pairs the verdict with confidence and class scores",
      "Feeds directly into moderation or analyst workflows",
    ],
  },
]

const panelVariants = {
  enter: (direction) => ({ opacity: 0, x: direction * 50 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction * -50 }),
}

export default function HowItWorks() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (index) => {
    if (index === active) {
      return
    }

    setDirection(index > active ? 1 : -1)
    setActive(index)
  }

  const currentStep = steps[active]
  const Icon = currentStep.icon

  return (
    <section id="how-it-works" className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="max-w-3xl">
          <p
            className="text-sm uppercase tracking-[0.36em] text-[#D4FF00]"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            HOW IT WORKS
          </p>
          <h2
            className="mt-4 text-[3.4rem] leading-[0.9] text-white sm:text-[4.5rem]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            A FORENSIC FLOW THAT STAYS HUMAN-READABLE.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            Every stage is designed to feel inspectable, not mystical. Move through the tabs to see how the detector
            ingests, reasons about, and reports a final judgment.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {steps.map((step, index) => (
            <button
              key={step.tab}
              type="button"
              onClick={() => goTo(index)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active === index
                  ? "border-[#D4FF00] bg-[#D4FF00] text-[#05050a]"
                  : "border-white/10 bg-white/4 text-white/70 hover:border-[#D4FF00]/30 hover:text-white"
              }`}
            >
              {step.tab}
            </button>
          ))}
        </div>

        <div className="pt-panel overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="flex flex-col">
                <div
                  className="w-fit rounded-full border border-[#D4FF00]/25 bg-[#D4FF00]/8 px-3 py-1 text-xs uppercase tracking-[0.32em] text-[#D4FF00]"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {currentStep.tech}
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#D4FF00]/20 bg-black/35 text-[#D4FF00]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-4xl text-white sm:text-5xl" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                    {currentStep.title}
                  </h3>
                </div>

                <p className="mt-6 max-w-xl text-base leading-8 text-white/72 sm:text-lg">{currentStep.body}</p>

                <ul className="mt-8 space-y-3">
                  {currentStep.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-white/74">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#D4FF00]" />
                      <span className="leading-7">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative min-h-[320px] rounded-[1.75rem] border border-white/10 bg-black/40 p-4 sm:p-6">
                <div className="pt-grid absolute inset-0 rounded-[1.75rem] opacity-40" />
                <div className="relative flex h-full items-center justify-center">
                  {active === 0 ? <UploadVisual /> : null}
                  {active === 1 ? <AnalyzeVisual /> : null}
                  {active === 2 ? <DetectVisual /> : null}
                  {active === 3 ? <VerdictVisual /> : null}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {steps.map((step, index) => (
                <button
                  key={step.tab}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to ${step.tab}`}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: active === index ? 24 : 7,
                    background: active === index ? "#D4FF00" : "rgba(255,255,255,0.28)",
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white transition ${
                  active === 0 ? "cursor-not-allowed opacity-30" : "hover:border-[#D4FF00]/30 hover:text-[#D4FF00]"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Prev
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                disabled={active === steps.length - 1}
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white transition ${
                  active === steps.length - 1
                    ? "cursor-not-allowed opacity-30"
                    : "hover:border-[#D4FF00]/30 hover:text-[#D4FF00]"
                }`}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function UploadVisual() {
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full max-w-[460px]">
      <rect x="28" y="24" width="264" height="192" rx="26" fill="rgba(5,5,10,0.9)" stroke="rgba(212,255,0,0.18)" />
      <rect x="56" y="54" width="208" height="132" rx="18" fill="none" stroke="rgba(255,255,255,0.18)" strokeDasharray="8 8" />
      <motion.rect
        x="56"
        y="66"
        width="208"
        height="6"
        fill="rgba(212,255,0,0.9)"
        animate={{ y: [66, 168, 66] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M160 86 L160 150 M136 112 L160 86 L184 112"
        stroke="#D4FF00"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ y: [6, -6, 6], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <rect x="108" y="164" width="104" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
      <rect x="120" y="168" width="80" height="4" rx="2" fill="rgba(212,255,0,0.75)" />
    </svg>
  )
}

function AnalyzeVisual() {
  const cells = Array.from({ length: 36 }, (_, index) => index)

  return (
    <svg viewBox="0 0 320 240" className="h-full w-full max-w-[460px]">
      <rect x="28" y="24" width="264" height="192" rx="26" fill="rgba(5,5,10,0.9)" stroke="rgba(255,255,255,0.12)" />
      {cells.map((cell, index) => {
        const col = index % 6
        const row = Math.floor(index / 6)

        return (
          <motion.rect
            key={cell}
            x={62 + col * 34}
            y={46 + row * 24}
            width="22"
            height="14"
            rx="4"
            fill={index % 3 === 0 ? "#D4FF00" : "rgba(26,26,255,0.9)"}
            animate={{ opacity: [0.18, 1, 0.28] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.05 }}
          />
        )
      })}
      <rect x="64" y="190" width="192" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
      <motion.rect
        x="64"
        y="190"
        width="192"
        height="8"
        rx="4"
        fill="url(#gridGlow)"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
      <defs>
        <linearGradient id="gridGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a1aff" />
          <stop offset="100%" stopColor="#D4FF00" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function DetectVisual() {
  const bars = [0, 1, 2, 3]

  return (
    <svg viewBox="0 0 320 240" className="h-full w-full max-w-[460px]">
      <rect x="28" y="24" width="264" height="192" rx="26" fill="rgba(5,5,10,0.9)" stroke="rgba(230,147,10,0.28)" />
      {bars.map((bar) => (
        <g key={bar}>
          <rect x="58" y={56 + bar * 38} width="204" height="18" rx="9" fill="rgba(255,255,255,0.1)" />
          <motion.rect
            x="58"
            y={56 + bar * 38}
            width="128"
            height="18"
            rx="9"
            fill={bar % 2 === 0 ? "#e6930a" : "#1a1aff"}
            animate={{ width: [88 + bar * 18, 188 - bar * 12, 96 + bar * 22] }}
            transition={{ duration: 1.8 + bar * 0.18, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      ))}
      <motion.circle
        cx="236"
        cy="84"
        r="16"
        fill="none"
        stroke="#D4FF00"
        strokeWidth="4"
        animate={{ scale: [1, 1.18, 1], opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <motion.path
        d="M224 84 H248"
        stroke="#D4FF00"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
    </svg>
  )
}

function VerdictVisual() {
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-[1.5rem] border border-[#D4FF00]/16 bg-black/55 p-6">
      <div
        className="text-xs uppercase tracking-[0.34em] text-white/50"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        FINAL VERDICT
      </div>
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-[5rem] leading-none text-[#D4FF00]"
        style={{ fontFamily: "Bebas Neue, sans-serif" }}
      >
        REAL
      </motion.div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Confidence</span>
          <span>96.4%</span>
        </div>
        <div className="h-3 rounded-full bg-white/8">
          <motion.div
            className="h-3 rounded-full bg-[linear-gradient(90deg,#D4FF00,#e6930a)]"
            initial={{ width: 0 }}
            animate={{ width: "96.4%" }}
            transition={{ duration: 1.1, ease: "easeOut", repeat: Infinity, repeatDelay: 1.2 }}
          />
        </div>
      </div>
      <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm leading-7 text-white/70">
        Confidence is calibrated for actionability, not theatrics, so analysts can trust what the panel is telling them.
      </div>
    </div>
  )
}
