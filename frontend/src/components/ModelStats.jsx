import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const panels = ["architecture", "training", "deployment"]

const stats = [
  ["97.4%", "Test Accuracy"],
  ["0.994", "AUC Score"],
  ["10K", "Images/Class"],
  ["3", "Training Phases"],
]

export default function ModelStats() {
  const [active, setActive] = useState("architecture")

  return (
    <section id="model" className="py-36 relative z-10 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#D4FF00" }}>
            UNDER THE HOOD
          </p>
          <h2 className="font-display text-white mt-4 text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">BUILT FOR PRECISION.</h2>
          <p className="text-white/40 mt-4">Multi-branch architecture trained on CIFAKE — 10,000 images per class.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          {stats.map(([value, label]) => (
            <div
              key={label}
              className="bg-[#05050a]/60 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 text-center"
            >
              <div className="text-5xl" style={{ color: "#D4FF00", fontFamily: "Bebas Neue, sans-serif" }}>
                {value}
              </div>
              <div className="font-mono text-xs text-white/40 uppercase tracking-widest mt-2">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#05050a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-1.5">
            {panels.map((p) => {
              const label = p[0].toUpperCase() + p.slice(1)
              const isActive = p === active
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActive(p)}
                  className={
                    "relative px-7 py-3 text-sm font-mono rounded-xl border-none cursor-pointer z-10 transition-colors " +
                    (isActive ? "text-[#05050a] font-medium" : "text-white/40 hover:text-white/70")
                  }
                >
                  {isActive ? (
                    <motion.div
                      layoutId="model-switch"
                      className="absolute inset-0 bg-[#D4FF00] rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  ) : null}
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            {active === "architecture" ? <ArchitecturePanel /> : null}
            {active === "training" ? <TrainingPanel /> : null}
            {active === "deployment" ? <DeploymentPanel /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function ArchitecturePanel() {
  const pills = ["Layer-wise LR", "Mixed Precision fp16", "3-Phase Training", "Batch Normalization", "Dropout 0.4"]
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col">
          <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">BRANCH 1 · SPATIAL</div>
          <div className="font-display text-3xl text-white leading-[0.9]">EfficientNet-B4</div>
          <div className="text-white/30 text-sm mt-2 flex-grow">CNN that looks at textures and spatial patterns in the image.</div>
          <div className="mt-4">
            <span className="inline-flex text-[#D4FF00] bg-[#D4FF00]/[0.08] border border-[#D4FF00]/20 rounded-full px-4 py-2 text-xs font-mono whitespace-nowrap">
              Feature Extraction
            </span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col">
          <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">BRANCH 2 · SEMANTICS</div>
          <div className="font-display text-3xl text-white leading-[0.9]">CLIP Model</div>
          <div className="text-white/30 text-sm mt-2 flex-grow">Understands the image at a semantic level, meaning it understands what the image means, not just how it looks.</div>
          <div className="mt-4">
            <span className="inline-flex text-[#D4FF00] bg-[#D4FF00]/[0.08] border border-[#D4FF00]/20 rounded-full px-4 py-2 text-xs font-mono whitespace-nowrap">
              400M Images Trained
            </span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col">
          <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">BRANCH 3 · SPECTRAL</div>
          <div className="font-display text-3xl text-white leading-[0.9]">DCT Frequency</div>
          <div className="text-white/30 text-sm mt-2 flex-grow">Analyzes Discrete Cosine Transform patterns to find hidden AI generator signals.</div>
          <div className="mt-4">
            <span className="inline-flex text-[#D4FF00] bg-[#D4FF00]/[0.08] border border-[#D4FF00]/20 rounded-full px-4 py-2 text-xs font-mono whitespace-nowrap">
              Frequency Domain
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 justify-center max-w-4xl mx-auto">
        {pills.map((p) => (
          <span
            key={p}
            className="bg-white/[0.03] border border-white/[0.07] text-white/50 font-mono text-xs rounded-full px-4 py-2"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}

function TrainingPanel() {
  const rows = [
    ["Optimizer", "AdamW"],
    ["Learning Rate", "1e-4 (layer-wise)"],
    ["LR Schedule", "Cosine Decay"],
    ["Batch Size", "32"],
    ["Phases", "3-Phase Strategy"],
    ["Augmentation", "Flip, Crop, Normalize"],
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">TRAINING CONFIG</div>
        <div className="divide-y divide-white/[0.05]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-white/[0.05] py-3 text-sm font-mono last:border-b-0">
              <span className="text-white/40">{k}</span>
              <span className="text-white/80">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">DATASET SPLIT</div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm font-mono text-white/60 mb-2">
              <span>REAL Images</span>
              <span>50%</span>
            </div>
            <div className="bg-white/[0.06] h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-mono text-white/60 mb-2">
              <span>FAKE Images</span>
              <span>50%</span>
            </div>
            <div className="bg-white/[0.06] h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-400"
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </div>

        <div className="text-white/20 text-xs font-mono mt-5">CIFAKE · 10,000 images per class · Google Colab T4</div>
      </div>
    </div>
  )
}

function DeploymentPanel() {
  const runtimeRows = [
    ["Model", "Multi-branch"],
    ["Framework", "PyTorch"],
    ["Precision", "fp16 Mixed"],
    ["GPU", "NVIDIA T4"],
    ["Platform", "HuggingFace Spaces"],
    ["Inference", "Sub-second"],
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <div className="text-white/30 text-xs font-mono uppercase tracking-widest">INFERENCE API</div>
        <div className="bg-black border border-white/[0.07] rounded-xl p-4 font-mono text-xs mt-3">
          <div style={{ color: "#D4FF00" }}>POST /predict</div>
          <div className="text-white/30 mt-1.5">Content-Type: multipart/form-data</div>
          <div className="text-white/30 mt-1.5">{`{ "prediction": "REAL"|"FAKE",`}</div>
          <div className="text-white/30 mt-1">{`  "confidence": 0.97 }`}</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["FastAPI", "Docker", "HuggingFace"].map((t) => (
            <span key={t} className="text-white/40 bg-white/[0.03] border border-white/[0.07] rounded-full px-4 py-2 text-xs font-mono">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">RUNTIME</div>
        <div className="divide-y divide-white/[0.05]">
          {runtimeRows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-3 text-sm font-mono">
              <span className="text-white/40">{k}</span>
              <span className="text-white/80">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

