const navItems = [
  { label: "Home", id: "home" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Model", id: "model" },
  { label: "Try It", id: "try-it" },
]

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="relative z-10 border-t border-white/8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="rounded-full border border-[#D4FF00] px-3 py-1 text-sm tracking-[0.2em] text-[#D4FF00]"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                [PT]
              </span>
              <span className="text-[2rem] leading-none text-white" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                PixelTruth
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/62">
              A cinematic AI image verification surface for teams that need to inspect evidence quickly and act with
              confidence.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/42" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              Navigation
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="w-fit text-left text-sm text-white/72 transition hover:text-[#D4FF00]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/42" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              Project
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/62">
              <p>Built to pair a forensic-style frontend with a FastAPI detector endpoint.</p>
              <p>Responsive by default, motion-aware, and hardened with cleanup paths for preview URLs and webcam streams.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/8 pt-6 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} PixelTruth. All rights reserved.</p>
          <p>Designed and rebuilt for trustworthy AI image review.</p>
        </div>
      </div>
    </footer>
  )
}
