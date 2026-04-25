import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

const links = [
  { label: "Home", id: "home" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Model", id: "model" },
  { label: "Try It", id: "try-it" },
]

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: "smooth" })
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const onNav = (id) => {
    scrollToId(id)
    setMenuOpen(false)
  }

  return (
    <header
      className={
        "fixed top-0 z-[100] w-full transition-all duration-200 " +
        (scrolled ? "bg-[rgba(5,5,10,0.85)] border-b border-white/[0.08]" : "bg-transparent")
      }
      style={scrolled ? { backdropFilter: "blur(20px)" } : undefined}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button type="button" onClick={() => onNav("home")} className="flex items-center">
          <span className="font-mono font-bold text-lg text-[#D4FF00] border-[1.5px] border-[#D4FF00] w-9 h-9 flex items-center justify-center rounded-sm">
            [VS]
          </span>
          <span className="text-white font-semibold text-base ml-2.5" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
            VeriSight
          </span>
        </button>

        <div className="hidden lg:flex items-center justify-center">
          <div className="border border-white/[0.08] rounded-full px-2 py-1.5 flex gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onNav(l.id)}
                className="font-mono text-white/50 hover:text-white text-sm px-4 py-1.5 rounded-full hover:bg-white/[0.06] transition-all duration-200"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center">
          <button
            type="button"
            onClick={() => onNav("try-it")}
            className="font-mono border border-[#D4FF00]/50 text-[#D4FF00] text-sm rounded-full px-5 py-2 hover:bg-[#D4FF00] hover:text-[#05050a] transition-all duration-200"
          >
            Try Detection
          </button>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
          className="lg:hidden text-white/60"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="lg:hidden bg-[#0e0e18]/95 backdrop-blur border-b border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-2">
            {links.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onNav(l.id)}
                className="font-mono text-white/60 hover:text-white text-sm rounded-xl px-4 py-3 text-left border border-white/[0.08] bg-white/[0.02]"
              >
                {l.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onNav("try-it")}
              className="font-mono border border-[#D4FF00]/50 text-[#D4FF00] text-sm rounded-xl px-4 py-3 text-left hover:bg-[#D4FF00] hover:text-[#05050a] transition-all duration-200"
            >
              Try Detection
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}

