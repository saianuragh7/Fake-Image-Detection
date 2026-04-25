const row1 = [
  "FAKE DETECTION",
  "97.4% ACCURACY",
  "CONVNEXT-BASE",
  "CIFAKE DATASET",
  "AI FORENSICS",
  "AUC 0.994",
]

const row2 = [
  "REAL OR FAKE",
  "PIXEL ANALYSIS",
  "DEEP LEARNING",
  "IMAGE FORENSICS",
  "PYTORCH",
  "HUGGINGFACE",
]

function Track({ items, animation }) {
  const list = [...items, ...items]
  return (
    <div
      className="flex w-max min-w-[200%] items-center gap-3"
      style={{ animation: `${animation} linear infinite` }}
    >
      {list.map((t, i) => (
        <span key={`${t}-${i}`} className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-white/15 uppercase tracking-widest">{t}</span>
          <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "#D4FF00", opacity: 0.4 }}>
            ◆
          </span>
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <section className="py-5 border-y border-white/[0.05] overflow-hidden relative z-10 bg-[#05050a]/60 backdrop-blur-sm">
      <div className="overflow-hidden">
        <div style={{ animationDuration: "30s" }}>
          <Track items={row1} animation="marquee-left 30s" />
        </div>
        <div className="mt-2" style={{ animationDuration: "25s" }}>
          <Track items={row2} animation="marquee-right 25s" />
        </div>
      </div>
    </section>
  )
}
