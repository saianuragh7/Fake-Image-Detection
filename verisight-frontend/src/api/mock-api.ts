import type {
  AnalyzeImageBody,
  ConfidenceBucket,
  HealthStatus,
  Scan,
  Stats,
  TimeseriesPoint,
  Verdict,
} from "./api.schemas";

const STORAGE_KEY = "verisight.scans.v1";

function isBrowserStorageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readScans(): Scan[] {
  if (!isBrowserStorageAvailable()) return seedScans();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedScans();
      writeScans(seeded);
      return seeded;
    }
    return JSON.parse(raw) as Scan[];
  } catch {
    return seedScans();
  }
}

function writeScans(scans: Scan[]) {
  if (!isBrowserStorageAvailable()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scans.slice(0, 80)));
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function hashText(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function dataUrlFromFile(file: Blob): Promise<string> {
  return new Promise((resolve) => {
    if (typeof FileReader === "undefined") {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof Image === "undefined") {
      resolve({ width: 1200, height: 800 });
      return;
    }

    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth || 1200, height: image.naturalHeight || 800 });
    image.onerror = () => resolve({ width: 1200, height: 800 });
    image.src = dataUrl;
  });
}

function buildSignals(fakeProbability: number) {
  const compression = clamp(fakeProbability + 9);
  const frequency = clamp(fakeProbability - 6);
  const lighting = clamp(100 - Math.abs(50 - fakeProbability) * 0.72);

  return [
    {
      name: "Generator fingerprint",
      score: frequency,
      weight: 0.38,
      description: "Frequency-domain artifacts consistent with synthetic generation pipelines.",
    },
    {
      name: "Compression integrity",
      score: compression,
      weight: 0.31,
      description: "JPEG block behavior, edge blending, and noise residual consistency.",
    },
    {
      name: "Semantic consistency",
      score: lighting,
      weight: 0.31,
      description: "Lighting, texture continuity, and structural plausibility across the frame.",
    },
  ];
}

async function analyzeImage(body: AnalyzeImageBody): Promise<Scan> {
  const file = body.image;
  const fileName = file instanceof File ? file.name : "uploaded-image";
  const mimeType = file.type || "image/jpeg";
  const seed = hashText(`${fileName}:${file.size}:${mimeType}`);
  const fakeProbability = clamp(38 + (seed % 47) + (fileName.toLowerCase().includes("fake") ? 18 : 0));
  const realProbability = 100 - fakeProbability;
  const verdict: Verdict = fakeProbability >= realProbability ? "fake" : "real";
  const confidence = Math.max(fakeProbability, realProbability);
  const previewDataUrl = await dataUrlFromFile(file);
  const { width, height } = await getImageSize(previewDataUrl);

  const scan: Scan = {
    id: crypto.randomUUID(),
    fileName,
    mimeType,
    fileSize: file.size,
    width,
    height,
    verdict,
    confidence,
    fakeProbability,
    realProbability,
    processingMs: 420 + (seed % 920),
    signals: buildSignals(fakeProbability),
    previewDataUrl,
    createdAt: new Date().toISOString(),
  };

  const scans = [scan, ...readScans()];
  writeScans(scans);
  return scan;
}

function seedScans(): Scan[] {
  const now = Date.now();
  return Array.from({ length: 8 }, (_, index) => {
    const fakeProbability = clamp(28 + ((index * 17) % 58));
    const realProbability = 100 - fakeProbability;
    const verdict: Verdict = fakeProbability >= realProbability ? "fake" : "real";
    const color = verdict === "fake" ? "ef4444" : "22d3ee";

    return {
      id: `demo-${index + 1}`,
      fileName: `verification-sample-${index + 1}.jpg`,
      mimeType: "image/jpeg",
      fileSize: 340000 + index * 54000,
      width: 1280,
      height: 853,
      verdict,
      confidence: Math.max(fakeProbability, realProbability),
      fakeProbability,
      realProbability,
      processingMs: 510 + index * 63,
      signals: buildSignals(fakeProbability),
      previewDataUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23060a12'/%3E%3Ccircle cx='320' cy='210' r='150' fill='%23${color}' opacity='.22'/%3E%3Cpath d='M110 292c72-86 132-117 200-84 84 41 126 7 220-68' stroke='%23${color}' stroke-width='18' fill='none' opacity='.7'/%3E%3C/svg%3E`,
      createdAt: new Date(now - index * 3600_000 * 7).toISOString(),
    };
  });
}

function getStats(scans: Scan[]): Stats {
  const totalScans = scans.length;
  const fakeCount = scans.filter((scan) => scan.verdict === "fake").length;
  const realCount = totalScans - fakeCount;
  const avgConfidence = totalScans
    ? scans.reduce((sum, scan) => sum + scan.confidence, 0) / totalScans
    : 0;
  const avgProcessingMs = totalScans
    ? scans.reduce((sum, scan) => sum + scan.processingMs, 0) / totalScans
    : 0;
  const since = Date.now() - 24 * 3600_000;

  return {
    totalScans,
    realCount,
    fakeCount,
    avgConfidence: Number(avgConfidence.toFixed(1)),
    avgProcessingMs: Number(avgProcessingMs.toFixed(0)),
    accuracy: 96.4,
    last24hScans: scans.filter((scan) => new Date(scan.createdAt).getTime() >= since).length,
  };
}

function getTimeseries(scans: Scan[], days: number): TimeseriesPoint[] {
  const today = new Date();
  const points = Array.from({ length: days }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - offset - 1));
    const key = date.toISOString().slice(0, 10);
    return { date: key, real: 0, fake: 0 };
  });

  const byDate = new Map(points.map((point) => [point.date, point]));
  for (const scan of scans) {
    const point = byDate.get(scan.createdAt.slice(0, 10));
    if (point) point[scan.verdict] += 1;
  }

  return points.map((point, index) => ({
    ...point,
    real: point.real + ((index * 3) % 5),
    fake: point.fake + ((index * 5) % 4),
  }));
}

function getDistribution(scans: Scan[]): ConfidenceBucket[] {
  const buckets = ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"].map((bucket) => ({
    bucket,
    count: 0,
  }));

  for (const scan of scans) {
    const index = Math.min(4, Math.max(0, Math.floor((scan.confidence - 50) / 10)));
    buckets[index].count += 1;
  }

  return buckets;
}

function getQueryValue(url: URL, key: string, fallback: number) {
  const value = Number(url.searchParams.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export async function mockApiFetch<T>(inputUrl: string, init: RequestInit): Promise<T> {
  const url = new URL(inputUrl, window.location.origin);
  const method = (init.method || "GET").toUpperCase();
  const scans = readScans();

  if (url.pathname === "/api/healthz") {
    return { status: "ok" } satisfies HealthStatus as T;
  }

  if (url.pathname === "/api/scans" && method === "GET") {
    return scans.slice(0, getQueryValue(url, "limit", 20)) as T;
  }

  if (url.pathname === "/api/scans" && method === "POST") {
    const formData = init.body instanceof FormData ? init.body : null;
    const file = formData?.get("image");
    if (!(file instanceof Blob)) {
      throw new Error("No image file was supplied.");
    }
    return analyzeImage({ image: file }) as Promise<T>;
  }

  const scanMatch = url.pathname.match(/^\/api\/scans\/([^/]+)$/);
  if (scanMatch && method === "GET") {
    const scan = scans.find((item) => item.id === scanMatch[1]);
    if (!scan) throw new Error("Scan not found.");
    return scan as T;
  }

  if (url.pathname === "/api/stats") {
    return getStats(scans) as T;
  }

  if (url.pathname === "/api/stats/timeseries") {
    return getTimeseries(scans, getQueryValue(url, "days", 30)) as T;
  }

  if (url.pathname === "/api/stats/confidence") {
    return getDistribution(scans) as T;
  }

  throw new Error(`Mock API route not implemented: ${method} ${url.pathname}`);
}

export function shouldUseMockApi(inputUrl: string) {
  const mode = import.meta.env.VITE_USE_MOCK_API;
  if (mode === "true") return true;
  return false;
}
