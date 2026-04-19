import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Camera, Link2, LoaderCircle, RefreshCcw, Upload, X } from "lucide-react"

const ENDPOINTS = ["/predict", "http://127.0.0.1:8000/predict", "http://localhost:8000/predict"]

const tabs = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "webcam", label: "Webcam", icon: Camera },
  { id: "url", label: "URL", icon: Link2 },
]

function clampPercent(value) {
  const numeric = Number(value ?? 0)

  if (!Number.isFinite(numeric)) {
    return 0
  }

  const normalized = numeric > 1 ? numeric : numeric * 100
  return Math.max(0, Math.min(100, normalized))
}

function revokeObjectUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
}

function stopTracks(stream) {
  stream?.getTracks().forEach((track) => track.stop())
}

function normalizeResult(data) {
  const payload = data?.result ?? data?.data ?? data

  if (!payload || typeof payload !== "object") {
    throw new Error("Unsupported response format.")
  }

  const sourceLabel = String(
    payload.label ?? payload.prediction ?? payload.verdict ?? payload.classification ?? payload.result ?? "",
  )

  if (!sourceLabel) {
    throw new Error("The response did not include a label.")
  }

  let label = sourceLabel.toUpperCase()
  if (label.includes("AI") || label.includes("FAKE")) {
    label = "FAKE"
  } else if (label.includes("REAL")) {
    label = "REAL"
  }

  let confidence = clampPercent(payload.confidence ?? payload.score ?? payload.probability ?? payload.confidence_score)
  let realProbability = clampPercent(
    payload.real_probability ?? payload.real_prob ?? payload.realProbability ?? payload.probabilities?.real,
  )
  let fakeProbability = clampPercent(
    payload.ai_probability ??
      payload.fake_prob ??
      payload.aiProbability ??
      payload.fakeProbability ??
      payload.probabilities?.fake,
  )

  if (!realProbability && !fakeProbability && confidence) {
    if (label === "REAL") {
      realProbability = confidence
      fakeProbability = 100 - confidence
    } else if (label === "FAKE") {
      fakeProbability = confidence
      realProbability = 100 - confidence
    }
  }

  if (!confidence) {
    confidence = Math.max(realProbability, fakeProbability)
  }

  if (label !== "REAL" && label !== "FAKE") {
    label = realProbability >= fakeProbability ? "REAL" : "FAKE"
  }

  return {
    label,
    confidence,
    realProbability,
    fakeProbability,
    sourceLabel,
    filename: payload.filename ?? payload.name ?? "input",
  }
}

async function wakeEndpoint(endpoint) {
  const url = new URL(endpoint, window.location.origin)
  const sameOriginPath = endpoint.startsWith("/") && url.origin === window.location.origin
  const wakeTargets = sameOriginPath ? ["/health"] : [`${url.origin}/health`, url.origin]

  for (const wakeTarget of wakeTargets) {
    try {
      await fetch(wakeTarget, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      return
    } catch {
      // Keep trying the next wake target or the real endpoint.
    }
  }
}

function PreviewCard({ preview, title, emptyText, onAnalyze, onClear, loading, canAnalyze }) {
  return (
    <div className="rounded-[1.75rem] border border-white/12 bg-black/30 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-white/48" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {title}
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#05050a]">
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <p className="max-w-xs text-center text-sm leading-7 text-white/42">{emptyText}</p>
        )}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze || loading}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
            !canAnalyze || loading
              ? "cursor-not-allowed bg-white/8 text-white/35"
              : "bg-[#D4FF00] text-[#05050a] hover:scale-[1.02]"
          }`}
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Analyze Image
        </button>
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
      <div className="text-sm uppercase tracking-[0.18em] text-white/48">{label}</div>
      <div className="mt-3 text-[3rem] leading-none text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
        {value}
      </div>
    </div>
  )
}

export default function TryIt() {
  const [activeTab, setActiveTab] = useState("upload")
  const [dragOver, setDragOver] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState("")
  const [capturedFile, setCapturedFile] = useState(null)
  const [capturedPreview, setCapturedPreview] = useState("")
  const [urlValue, setUrlValue] = useState("")
  const [urlFile, setUrlFile] = useState(null)
  const [urlPreview, setUrlPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const inputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const uploadPreviewRef = useRef("")
  const urlPreviewRef = useRef("")

  const stopStream = () => {
    stopTracks(streamRef.current)
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    let cancelled = false

    const startWebcam = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser cannot access a webcam.")
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        })

        if (cancelled) {
          stopTracks(stream)
          return
        }

        stopStream()
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch (cameraError) {
        if (!cancelled) {
          setError(cameraError?.message || "Camera access failed.")
        }
      }
    }

    if (activeTab === "webcam") {
      setError("")
      void startWebcam()
    } else {
      stopStream()
    }

    return () => {
      cancelled = true
      stopStream()
    }
  }, [activeTab])

  useEffect(() => {
    return () => {
      stopStream()
      revokeObjectUrl(uploadPreviewRef.current)
      revokeObjectUrl(urlPreviewRef.current)
    }
  }, [])

  const handleFile = (file) => {
    if (!file) {
      return
    }

    revokeObjectUrl(uploadPreviewRef.current)
    const nextPreview = URL.createObjectURL(file)
    uploadPreviewRef.current = nextPreview

    setUploadFile(file)
    setUploadPreview(nextPreview)
    setError("")
  }

  const clearUpload = () => {
    revokeObjectUrl(uploadPreviewRef.current)
    uploadPreviewRef.current = ""
    setUploadFile(null)
    setUploadPreview("")

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const clearUrlAsset = () => {
    revokeObjectUrl(urlPreviewRef.current)
    urlPreviewRef.current = ""
    setUrlFile(null)
    setUrlPreview("")
  }

  const reset = () => {
    stopStream()
    setError("")
    setShowModal(false)
    setResult(null)

    if (activeTab === "upload") {
      clearUpload()
    }

    if (activeTab === "webcam") {
      setCapturedFile(null)
      setCapturedPreview("")
    }

    if (activeTab === "url") {
      clearUrlAsset()
      setUrlValue("")
    }
  }

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setError("The webcam feed is not ready yet.")
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      setError("Canvas capture is unavailable.")
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Could not capture the frame.")
        return
      }

      const file = new File([blob], `pixeltruth-webcam-${Date.now()}.png`, { type: "image/png" })
      setCapturedFile(file)
      setCapturedPreview(canvas.toDataURL("image/png"))
      setError("")
    }, "image/png")
  }

  const loadUrl = async () => {
    if (!urlValue.trim()) {
      setError("Enter an image URL first.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(urlValue.trim())
      if (!response.ok) {
        throw new Error(`Could not load image (${response.status}).`)
      }

      const blob = await response.blob()
      if (!blob.type.startsWith("image/")) {
        throw new Error("That URL did not return an image.")
      }

      clearUrlAsset()

      const extension = blob.type.split("/")[1] || "jpg"
      const file = new File([blob], `pixeltruth-url-${Date.now()}.${extension}`, { type: blob.type })
      const nextPreview = URL.createObjectURL(file)

      urlPreviewRef.current = nextPreview
      setUrlFile(file)
      setUrlPreview(nextPreview)
    } catch (urlError) {
      setError(urlError?.message || "URL loading failed.")
    } finally {
      setLoading(false)
    }
  }

  const currentFile = activeTab === "upload" ? uploadFile : activeTab === "webcam" ? capturedFile : urlFile

  const handleAnalyze = async () => {
    if (!currentFile) {
      setError("Choose an image before running detection.")
      return
    }

    setLoading(true)
    setError("")

    const failures = []

    for (const endpoint of ENDPOINTS) {
      try {
        await wakeEndpoint(endpoint)

        const formData = new FormData()
        formData.append("file", currentFile)

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        })

        let payload = {}
        const text = await response.text()
        if (text) {
          payload = JSON.parse(text)
        }

        if (!response.ok) {
          throw new Error(payload?.detail || payload?.message || `Request failed at ${endpoint}`)
        }

        const normalized = normalizeResult(payload)
        setResult(normalized)
        setShowModal(true)
        setLoading(false)
        return
      } catch (analysisError) {
        failures.push(`${endpoint}: ${analysisError?.message || "unknown error"}`)
      }
    }

    setLoading(false)
    setError(failures.join(" | "))
  }

  return (
    <section id="try-it" className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="max-w-3xl">
          <p
            className="text-sm uppercase tracking-[0.36em] text-[#D4FF00]"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            TRY IT
          </p>
          <h2
            className="mt-4 text-[3.4rem] leading-[0.9] text-white sm:text-[4.5rem]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            TEST A FRAME IN THREE DIFFERENT WAYS.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            Upload a file, capture a live frame, or pull an image from a URL. The result returns in a focused modal
            once the detector responds.
          </p>
        </div>

        <div className="pt-panel w-full rounded-[2rem] p-6 sm:p-8">
          <div className="w-fit rounded-[1.25rem] border border-white/10 bg-black/30 p-2">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      activeTab === tab.id ? "text-[#05050a]" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {activeTab === tab.id ? (
                      <motion.div layoutId="tryit-tab" className="absolute inset-0 -z-10 rounded-xl bg-[#D4FF00]" />
                    ) : null}
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="mt-8"
            >
              {activeTab === "upload" ? (
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <div
                    className={`rounded-[1.75rem] border border-dashed p-6 transition ${
                      dragOver ? "border-[#D4FF00] bg-[#D4FF00]/6" : "border-white/12 bg-black/30"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(event) => {
                      event.preventDefault()
                      setDragOver(false)
                      handleFile(event.dataTransfer.files?.[0])
                    }}
                  >
                    <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#D4FF00]/20 bg-black/50 text-[#D4FF00]">
                        <Upload className="h-7 w-7" />
                      </div>
                      <h3 className="mt-6 text-4xl text-white" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                        DROP IMAGE EVIDENCE
                      </h3>
                      <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
                        Drag a JPG or PNG into the zone, or open the file chooser to send a frame into the detector.
                      </p>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleFile(event.target.files?.[0])}
                      />
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="mt-6 rounded-full bg-[#D4FF00] px-6 py-3 text-sm font-semibold text-[#05050a]"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>

                  <PreviewCard
                    preview={uploadPreview}
                    title="Upload Preview"
                    emptyText="The uploaded frame will appear here before analysis."
                    onAnalyze={handleAnalyze}
                    onClear={reset}
                    loading={loading}
                    canAnalyze={Boolean(uploadFile)}
                  />
                </div>
              ) : null}

              {activeTab === "webcam" ? (
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.75rem] border border-white/12 bg-black/30 p-4">
                    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#05050a]">
                      <video ref={videoRef} className="aspect-[4/3] w-full object-cover" playsInline muted />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={captureFrame}
                        className="rounded-full bg-[#D4FF00] px-5 py-3 text-sm font-semibold text-[#05050a]"
                      >
                        Capture Frame
                      </button>
                      <button
                        type="button"
                        onClick={reset}
                        className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/75"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <PreviewCard
                    preview={capturedPreview}
                    title="Captured Frame"
                    emptyText="Capture a webcam frame to preview and analyze it."
                    onAnalyze={handleAnalyze}
                    onClear={reset}
                    loading={loading}
                    canAnalyze={Boolean(capturedFile)}
                  />
                </div>
              ) : null}

              {activeTab === "url" ? (
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.75rem] border border-white/12 bg-black/30 p-6">
                    <label className="text-xs uppercase tracking-[0.28em] text-white/48" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      Image URL
                    </label>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="url"
                        value={urlValue}
                        onChange={(event) => setUrlValue(event.target.value)}
                        placeholder="https://example.com/frame.jpg"
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none placeholder:text-white/28 focus:border-[#D4FF00]/40"
                      />
                      <button
                        type="button"
                        onClick={loadUrl}
                        className="rounded-2xl bg-[#D4FF00] px-5 py-3 text-sm font-semibold text-[#05050a]"
                      >
                        Load Image
                      </button>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/60">
                      Remote hosts with strict CORS rules can block browser-side fetches. If that happens, download the
                      image and use the Upload tab instead.
                    </p>
                  </div>

                  <PreviewCard
                    preview={urlPreview}
                    title="URL Preview"
                    emptyText="Loaded URL images show up here once the browser can fetch them."
                    onAnalyze={handleAnalyze}
                    onClear={reset}
                    loading={loading}
                    canAnalyze={Boolean(urlFile)}
                  />
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {error ? (
            <div className="mt-6 rounded-2xl border border-[#e6930a]/25 bg-[#e6930a]/8 px-4 py-3 text-sm leading-7 text-[#f3c887]">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showModal && result ? (
          <motion.div
            key="tryit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowModal(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#05050a] shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
            >
              <div className="h-1.5 w-full bg-[linear-gradient(90deg,#1a1aff_0%,#D4FF00_55%,#e6930a_100%)]" />
              <button
                type="button"
                aria-label="Close result modal"
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-8 p-6 sm:p-8">
                <div className="pr-12">
                  <div
                    className="text-xs uppercase tracking-[0.34em] text-white/48"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    DETECTION RESULT
                  </div>
                  <div className="mt-3 text-[5rem] leading-none text-[#D4FF00]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                    {result.label}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    Source label: {result.sourceLabel} for <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{result.filename}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-white/72">
                    <span>Confidence</span>
                    <span>{result.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 rounded-full bg-white/8">
                    <motion.div
                      className={`h-4 rounded-full ${
                        result.label === "REAL"
                          ? "bg-[linear-gradient(90deg,#D4FF00,#9dff7a)]"
                          : "bg-[linear-gradient(90deg,#1a1aff,#e6930a)]"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      exit={{ width: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricCard label="Real probability" value={`${result.realProbability.toFixed(1)}%`} />
                  <MetricCard label="Fake probability" value={`${result.fakeProbability.toFixed(1)}%`} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
