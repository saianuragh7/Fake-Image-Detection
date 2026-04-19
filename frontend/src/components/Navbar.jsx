import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

const links = [
  { label: "Home", id: "home" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Model", id: "model" },
  { label: "Try It", id: "try-it" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
    }

    onScroll()
    window.addEventListener("scroll", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const scrollToSection = (id, closeMenu = false) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }

    if (closeMenu) {
      setMenuOpen(false)
    }
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 transition-all duration-300"
      style={
        scrolled
          ? {
              background: "rgba(5,5,10,0.85)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(212,255,0,0.12)",
            }
          : {
              background: "transparent",
            }
      }
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className="flex items-center gap-3 text-left"
        >
          <span
            className="rounded-full border border-[#D4FF00] px-3 py-1 text-sm tracking-[0.2em] text-[#D4FF00]"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            [PT]
          </span>
          <span className="text-[2rem] uppercase leading-none text-white" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
            PixelTruth
          </span>
        </button>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToSection(link.id)}
              className="text-sm font-medium text-white/72 transition hover:text-[#D4FF00]"
            >
              {link.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => scrollToSection("try-it")}
            className="rounded-full border border-[#D4FF00]/40 bg-[#D4FF00] px-5 py-2 text-sm font-semibold text-[#05050a] transition hover:scale-[1.02] hover:bg-white"
          >
            Try Detection
          </button>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-[rgba(5,5,10,0.96)] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id, true)}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-left text-white/80 transition hover:border-[#D4FF00]/30 hover:text-[#D4FF00]"
              >
                {link.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => scrollToSection("try-it", true)}
              className="mt-2 rounded-2xl bg-[#D4FF00] px-4 py-3 font-semibold text-[#05050a]"
            >
              Try Detection
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
