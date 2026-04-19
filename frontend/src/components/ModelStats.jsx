import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const statCards = [
  { label: "Holdout Accuracy", value: "96.4%" },
  { label: "Images Trained", value: "14.2M" },
  { label: "Input Resolution", value: "224px" },
  { label: "Inference Time", value: "118ms" },
]

const views = [
  { id: "architecture", label: "Architecture" },
  { id: "training", label: "Training" },
  { id: "deployment", label: "Deployment" },
]

const datasetBars = [
  { label: "Real photos", width: "92%", color: "bg-[#D4FF00]" },
  { label: "AI images", width: "84%", color: "bg-[#1a1aff]" },
  { label: "Hard negatives", width: "61%", color: "bg-[#e6930a]" },
]

export default function ModelStats() {
  const [active, setActive] = useState("architecture")

  return (
    <section id="model" className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="max-w-3xl">
          <p
            className="text-sm uppercase tracking-[0.36em] text-[#D4FF00]"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            MODEL STATS
          </p>
          <h2
            className="mt-4 text-[3.4rem] leading-[0.9] text-white sm:text-[4.5rem]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            SIGNAL-FIRST METRICS, NOT EMPTY HYPE.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            Switch between architecture, training, and deployment to inspect how the detector is built, tuned, and
            shipped.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="pt-panel rounded-[1.5rem] p-5 sm:p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-white/48">{card.label}</div>
              <div className="mt-3 text-[3rem] leading-none text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        <div className="w-fit rounded-[1.25rem] border border-white/10 bg-black/30 p-2">
          <div className="flex flex-wrap gap-2">
            {views.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActive(view.id)}
                className={`relative rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active === view.id ? "text-[#05050a]" : "text-white/70 hover:text-white"
                }`}
              >
                {active === view.id ? (
                  <motion.div layoutId="model-switch" className="absolute inset-0 -z-10 rounded-xl bg-[#D4FF00]" />
                ) : null}
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-panel rounded-[2rem] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              {active === "architecture" ? <ArchitecturePanel /> : null}
              {active === "training" ? <TrainingPanel /> : null}
              {active === "deployment" ? <DeploymentPanel /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function ArchitecturePanel() {
  const cards = [
    {
      title: "RGB Backbone",
      body: "A spatial branch learns semantic coherence and catches texture choices that feel plausible to a generator but uncommon in camera-native imagery.",
    },
    {
      title: "Frequency Branch",
      body: "FFT-derived features expose periodic residue, smoothing patterns, and repeated signal structures hidden from a purely semantic encoder.",
    },
    {
      title: "Calibration Head",
      body: "A confidence head keeps verdicts grounded, translating strong activations into risk scores analysts can act on without over-trusting the model.",
    },
  ]

  const pills = ["ConvNeXt", "FFT maps", "dual-branch fusion", "dropout regularization", "confidence calibration"]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
            <div className="text-[2.1rem] leading-none text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
              {card.title}
            </div>
            <p className="mt-4 text-sm leading-7 text-white/72">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {pills.map((pill) => (
          <span
            key={pill}
            className="rounded-full border border-[#D4FF00]/20 bg-[#D4FF00]/8 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#D4FF00]"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  )
}

function TrainingPanel() {
  const rows = [
    ["Image size", "224 x 224"],
    ["Optimizer", "AdamW"],
    ["Warmup", "5 epochs cosine ramp"],
    ["Augmentations", "flip, crop, JPEG perturbation"],
    ["Checkpointing", "best calibrated validation"],
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
        <div className="text-[2.1rem] leading-none text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
          Training Config
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-white/8 last:border-b-0">
                  <td className="px-4 py-3 text-white/55">{label}</td>
                  <td className="px-4 py-3 text-white">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
        <div className="text-[2.1rem] leading-none text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
          Dataset Balance
        </div>
        <div className="mt-6 space-y-5">
          {datasetBars.map((bar, index) => (
            <div key={bar.label}>
              <div className="mb-2 flex items-center justify-between text-sm text-white/72">
                <span>{bar.label}</span>
                <span>{bar.width}</span>
              </div>
              <div className="h-3 rounded-full bg-white/8">
                <motion.div
                  className={`h-3 rounded-full ${bar.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: bar.width }}
                  transition={{ duration: 0.7 + index * 0.12, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DeploymentPanel() {
  const runtimeRows = [
    ["API mode", "FastAPI / multipart image upload"],
    ["Fallback path", "same-origin /predict with local proxy in dev"],
    ["Output", "verdict, confidence, class probabilities"],
    ["Safety", "input validation + graceful endpoint fallback"],
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[1.5rem] border border-white/10 bg-[#05050a]/80 p-5">
        <div className="text-[2.1rem] leading-none text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
          API Snapshot
        </div>
        <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/8 bg-black/60 p-4 text-sm leading-7 text-white/72">
          <code>{`POST /predict
Accept: application/json
Body: multipart/form-data (file)

{
  "label": "REAL",
  "confidence": 0.964,
  "real_prob": 0.964,
  "fake_prob": 0.036
}`}</code>
        </pre>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
        <div className="text-[2.1rem] leading-none text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
          Runtime Table
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <tbody>
              {runtimeRows.map(([label, value]) => (
                <tr key={label} className="border-b border-white/8 last:border-b-0">
                  <td className="px-4 py-3 text-white/55">{label}</td>
                  <td className="px-4 py-3 text-white">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
