import { useEffect, useRef, useState } from "react"

export default function LiquidBackground() {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) {
      return undefined
    }

    let animId = 0
    let t = 0
    let lastFrame = 0
    let painted = false

    const resize = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth / 3))
      canvas.height = Math.max(1, Math.floor(window.innerHeight / 3))
      canvas.style.width = "100vw"
      canvas.style.height = "100vh"
      canvas.style.imageRendering = "pixelated"
    }

    const draw = () => {
      const now = Date.now()
      if (now - lastFrame <= 40) {
        animId = requestAnimationFrame(draw)
        return
      }

      lastFrame = now

      const W = canvas.width
      const H = canvas.height
      const imageData = ctx.createImageData(W, H)
      const data = imageData.data
      t += 0.003

      for (let py = 0; py < H; py += 1) {
        for (let px = 0; px < W; px += 1) {
          const nx = px * 0.012
          const ny = py * 0.012
          const n1 = Math.sin(nx + t) * Math.cos(ny - t * 0.7)
          const n2 = Math.sin(nx * 2.3 - t * 0.5 + Math.cos(ny * 1.8)) * 0.5
          const n3 = Math.cos(nx * 0.7 + ny * 1.2 + t * 0.3) * 0.3
          const combined = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 0.5 + 0.5
          const bands = Math.sin(combined * Math.PI * 8 + t * 1.5) * 0.5 + 0.5
          const fine = Math.sin(combined * Math.PI * 20 - t) * 0.5 + 0.5
          const v = bands * 0.65 + fine * 0.35

          let r
          let g
          let b

          if (v < 0.2) {
            r = 5
            g = 5
            b = 10
          } else if (v < 0.5) {
            const x = (v - 0.2) / 0.3
            r = Math.round(5 + 21 * x)
            g = Math.round(5 + 21 * x)
            b = Math.round(10 + 245 * x)
          } else if (v < 0.65) {
            const x = (v - 0.5) / 0.15
            r = Math.round(26 * (1 - x) + 5 * x)
            g = Math.round(26 * (1 - x) + 5 * x)
            b = Math.round(255 * (1 - x) + 10 * x)
          } else if (v < 0.82) {
            const x = (v - 0.65) / 0.17
            r = Math.round(5 + 225 * x)
            g = Math.round(5 + 142 * x)
            b = 5
          } else {
            r = 230
            g = 147
            b = 10
          }

          const edge = Math.abs(Math.sin(combined * Math.PI * 8 + t * 1.5))
          if (edge < 0.05) {
            const fade = edge / 0.05
            r = Math.round(r * fade)
            g = Math.round(g * fade)
            b = Math.round(b * fade)
          }

          const idx = (py * W + px) * 4
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = 255
        }
      }

      ctx.putImageData(imageData, 0, 0)

      const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9)
      vignette.addColorStop(0, "rgba(5,5,10,0)")
      vignette.addColorStop(1, "rgba(5,5,10,0.7)")
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)

      if (!painted) {
        painted = true
        setReady(true)
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    animId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
        imageRendering: "pixelated",
        transition: "opacity 1.5s ease",
        opacity: ready ? 0.85 : 0,
      }}
    />
  )
}
