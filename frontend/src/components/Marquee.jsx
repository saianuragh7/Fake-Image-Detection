const items = [
  "GAN fingerprint",
  "diffusion residue",
  "frequency aliasing",
  "metadata drift",
  "prompt artifact trace",
  "compression mismatch",
]

export default function Marquee() {
  const repeatedItems = [...items, ...items]

  return (
    <section className="relative z-10 border-y border-white/8 bg-black/25 py-4 backdrop-blur-md">
      <div className="overflow-hidden">
        <div className="pt-marquee-track gap-3 px-3">
          {repeatedItems.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-full border border-white/8 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.32em] text-white/58 sm:text-sm"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
