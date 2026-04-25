import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Cpu, ScanFace, ShieldCheck, Upload } from "lucide-react"

const steps = [
  {
    id: 0,
    tab: "01 — Upload",
    icon: Upload,
    title: "Upload Any Image",
    tech: "JPEG · PNG · WEBP",
    body: "Drop any image, whether authentic or synthetic. VeriSight prepares it for forensic analysis instantly.",
    points: ["Drag & drop or click to browse", "Supports JPEG, PNG, WEBP", "No account required", "Max 10MB per image"],
  },
  {
    id: 1,
    tab: "02 — Analyze",
    icon: Cpu,
    title: "Forensic Analysis",
    tech: "ConvNeXt-Base · CIFAKE",
    body: "ConvNeXt-Base scans pixel-level patterns, frequency domain artifacts, and AI generation signatures across the entire image.",
    points: ["ConvNeXt-Base backbone", "Trained on 10K images per class", "Detects GAN and diffusion artifacts", "fp16 mixed precision"],
  },
  {
    id: 2,
    tab: "03 — Detect",
    icon: ScanFace,
    title: "Pattern Detection",
    tech: "WeightedSampler · Label Smoothing",
    body: "3-phase training with WeightedRandomSampler and label smoothing ensures the model generalizes to unseen AI-generated content.",
    points: [
      "3-phase training strategy",
      "WeightedRandomSampler for balance",
      "Label smoothing ε = 0.1",
      "Layer-wise learning rates",
    ],
  },
  {
    id: 3,
    tab: "04 — Verdict",
    icon: ShieldCheck,
    title: "REAL or FAKE Verdict",
    tech: "97.4% Accuracy · AUC 0.994",
    body: "Receive a clear REAL or FAKE verdict with confidence percentage. The model is calibrated for high precision on both classes.",
    points: ["REAL or FAKE classification", "Confidence score 0–100%", "AUC score of 0.994", "Sub-second inference"],
  },
]

const analyzeValues = Array.from({ length: 36 }, (_, i) => {
  const v = (12 + ((i * 37) % 85)) / 100
  return v.toFixed(2)
})

export default function HowItWorks() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (i) => {
    if (i === active) return
    setDirection(i > active ? 1 : -1)
    setActive(i)
  }

  const current = steps[active]
  const Icon = current.icon

  return (
    <section id="how-it-works" className="py-36 relative z-10 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#D4FF00" }}>
            THE PIPELINE
          </p>
          <h2 className="font-display text-white mt-4 text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">
            HOW VERISIGHT WORKS.
          </h2>
          <p className="text-white/40 font-light mt-4">From upload to verdict in under a second.</p>
        </div>

        <div className="flex gap-2 justify-center flex-wrap mb-12">
          {steps.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s.id)}
              className={
                "px-5 py-2.5 rounded-xl text-sm font-mono whitespace-nowrap border cursor-pointer transition-all duration-200 " +
                (active === s.id
                  ? "border-[#D4FF00]/30 bg-[#D4FF00]/[0.08] text-[#D4FF00]"
                  : "border-white/[0.07] text-white/40 bg-transparent hover:text-white/70 hover:border-white/15")
              }
            >
              {s.tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-[#D4FF00]/20 bg-[#D4FF00]/[0.06]">
                <span className="font-mono text-xs" style={{ color: "#D4FF00" }}>
                  {current.tech}
                </span>
              </div>

              <div className="mt-6">
                <div className="w-14 h-14 bg-[#D4FF00]/10 rounded-2xl flex items-center justify-center">
                  <Icon className="text-[#D4FF00]" size={26} />
                </div>
                <h3 className="font-display text-white mt-4 text-4xl sm:text-5xl leading-[0.9]">{current.title}</h3>
                <p className="text-white/50 text-base leading-relaxed mt-3 font-light">{current.body}</p>

                <div className="mt-6 flex flex-col gap-2.5">
                  {current.points.map((p) => (
                    <div key={p} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] flex-shrink-0" />
                      <span className="text-white/60 text-sm font-mono">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#05050a]/60 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-8 min-h-[260px] flex items-center justify-center">
              {active === 0 ? <UploadVisual /> : null}
              {active === 1 ? <AnalyzeVisual /> : null}
              {active === 2 ? <DetectVisual /> : null}
              {active === 3 ? <VerdictVisual /> : null}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-10 max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            className={
              "flex items-center gap-2 border border-white/[0.08] text-white/40 rounded-full px-6 py-2.5 text-sm font-mono bg-none cursor-pointer transition-all " +
              (active === 0 ? "opacity-30 cursor-not-allowed" : "hover:border-white/20 hover:text-white/70")
            }
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <div className="flex gap-2 items-center">
            {steps.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(s.id)}
                aria-label={`Go to ${s.tab}`}
                className="transition-all"
                style={
                  active === s.id
                    ? { width: 24, height: 7, borderRadius: 999, background: "#D4FF00" }
                    : { width: 7, height: 7, borderRadius: 999, background: "rgba(255,255,255,0.2)" }
                }
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={active === 3}
            className={
              "flex items-center gap-2 bg-[#D4FF00]/[0.08] border border-[#D4FF00]/20 text-[#D4FF00] rounded-full px-6 py-2.5 text-sm font-mono cursor-pointer transition-all " +
              (active === 3 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#D4FF00]/[0.15]")
            }
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

function UploadVisual() {
  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="16" width="196" height="148" rx="18" stroke="#D4FF00" strokeDasharray="6 4" opacity="0.5" />

      <path
        d="M24 34 V24 H34 M186 24 H196 V34 M196 146 V156 H186 M34 156 H24 V146"
        stroke="#D4FF00"
        strokeWidth="2"
        opacity="0.8"
      />

      <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <line x1="110" y1="62" x2="110" y2="112" stroke="#D4FF00" strokeWidth="3" strokeLinecap="round" />
        <polyline
          points="92,78 110,60 128,78"
          stroke="#D4FF00"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </motion.g>

      <motion.line
        x1="22"
        x2="198"
        y1="35"
        y2="35"
        stroke="#D4FF00"
        strokeWidth="2"
        opacity="0.25"
        animate={{ y: [35, 135, 35] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <text x="64" y="150" fill="rgba(212,255,0,0.35)" fontSize="7" fontFamily="JetBrains Mono">
        IMAGE LOADED
      </text>
    </svg>
  )
}

function AnalyzeVisual() {
  const cells = useMemo(() => analyzeValues, [])
  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="204" height="160" rx="18" stroke="rgba(255,255,255,0.12)" />

      {cells.map((v, index) => {
        const col = index % 6
        const row = Math.floor(index / 6)
        const x = 22 + col * 32
        const y = 36 + row * 20
        return (
          <motion.text
            key={`${v}-${index}`}
            x={x}
            y={y}
            fill="rgba(212,255,0,0.4)"
            fontFamily="JetBrains Mono"
            fontSize="8"
            animate={{ opacity: [0.1, 0.9, 0.1] }}
            transition={{ duration: 3, delay: index * 0.09, repeat: Infinity, ease: "easeInOut" }}
          >
            {v}
          </motion.text>
        )
      })}

      <motion.rect
        x="8"
        y="10"
        width="204"
        height="2"
        fill="rgba(212,255,0,0.2)"
        animate={{ y: [10, 165, 10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <text x="40" y="165" fill="rgba(212,255,0,0.35)" fontSize="7" fontFamily="JetBrains Mono">
        PIXEL PATTERN SCAN
      </text>
    </svg>
  )
}

function DetectVisual() {
  const rows = [
    ["GAN Artifact", "92%", 0.92],
    ["Freq Anomaly", "78%", 0.78],
    ["Texture Mismatch", "65%", 0.65],
    ["Edge Artifact", "43%", 0.43],
  ]

  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="40" y="24" fill="rgba(212,255,0,0.35)" fontSize="7" fontFamily="JetBrains Mono">
        ARTIFACT DETECTION
      </text>

      {rows.map(([label, pct, val], i) => {
        const y = 50 + i * 28
        return (
          <g key={label}>
            <text x="10" y={y + 4} fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="JetBrains Mono">
              {label}
            </text>
            <text x="186" y={y + 4} fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="JetBrains Mono">
              {pct}
            </text>
            <rect x="50" y={y + 10} width="160" height="7" rx="3.5" fill="rgba(255,255,255,0.08)" />
            <motion.rect
              x="50"
              y={y + 10}
              height="7"
              rx="3.5"
              fill="#D4FF00"
              initial={{ width: 0 }}
              animate={{ width: 160 * val }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: [0.4, 0, 0.2, 1] }}
            />
          </g>
        )
      })}
    </svg>
  )
}

function VerdictVisual() {
  return (
    <div className="text-center">
      <motion.p
        className="font-display leading-none"
        style={{ fontSize: "5rem" }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-emerald-400">REAL</span>
      </motion.p>

      <div className="bg-white/[0.06] h-2 rounded-full overflow-hidden mt-4">
        <motion.div
          className="h-full bg-emerald-400 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "97%" }}
          transition={{ duration: 1.5, type: "spring", stiffness: 180, damping: 22 }}
        />
      </div>

      <p className="text-white/30 text-xs font-mono mt-2">97% confidence · Authentic Image Detected</p>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {["ConvNeXt-Base", "CIFAKE", "AUC 0.994"].map((t) => (
          <span
            key={t}
            className="text-[#D4FF00] bg-[#D4FF00]/[0.08] border border-[#D4FF00]/20 rounded-full px-4 py-2 text-xs font-mono"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
