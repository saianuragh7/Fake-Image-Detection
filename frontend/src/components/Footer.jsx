const navItems = [
  { label: "Home", id: "home" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Model", id: "model" },
  { label: "Try It", id: "try-it" },
]

const projectLinks = [
  { label: "Backend health", href: "/health" },
  { label: "Prediction API", href: "/api/predict" },
  { label: "Scan analytics", href: "/api/stats" },
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
    <footer className="relative z-10 border-t border-white/[0.07] px-6 py-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="rounded-full border border-[#D4FF00] px-3 py-1 text-sm tracking-[0.2em] text-[#D4FF00]"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                [VS]
              </span>
              <span className="text-[2rem] leading-none text-white" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                VeriSight
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/62">
              Production-ready AI image forensics for upload, webcam, and URL-based authenticity checks.
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
            <div className="mt-4 flex flex-col gap-3">
              {projectLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit text-left text-sm text-white/72 transition hover:text-[#D4FF00]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} VeriSight. All rights reserved.</p>
          <p>Built for trustworthy image authenticity review and recruiter-ready presentation.</p>
        </div>
      </div>
    </footer>
  )
}

