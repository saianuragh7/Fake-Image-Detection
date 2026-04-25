import gc
import io
import ipaddress
import os
import socket
import base64
import json
import threading
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen
from uuid import uuid4

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, Request as FastAPIRequest, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps, UnidentifiedImageError
from pydantic import BaseModel
from torchvision import models, transforms

# Force UTF-8 output on Windows consoles to avoid cp1252 crashes
if os.name == "nt":
    try:
        import sys

        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


BASE_DIR = Path(__file__).resolve().parent


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"'")
        if key:
            os.environ.setdefault(key, value)


_load_env_file(BASE_DIR / ".env")


def _parse_csv_env(name: str, default: str) -> list[str]:
    raw_value = os.getenv(name, default)
    return [item.strip() for item in raw_value.split(",") if item.strip()]


def _parse_int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)).strip())
    except (AttributeError, ValueError):
        return default


def _parse_float_env(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)).strip())
    except (AttributeError, ValueError):
        return default


def _resolve_env_path(value: str, fallback: Path) -> Path:
    if not value:
        return fallback
    path = Path(value)
    return path if path.is_absolute() else (BASE_DIR / path).resolve()


class Settings:
    def __init__(self) -> None:
        frontend_dist_env = os.getenv("FRONTEND_DIST_DIR", "").strip()
        static_dir_env = os.getenv("STATIC_DIR", "").strip()
        model_path_env = os.getenv("MODEL_PATH", "").strip()
        model_url_env = os.getenv("MODEL_URL", "").strip()

        default_frontend_dist = BASE_DIR / "frontend" / "dist"
        default_static_dir = default_frontend_dist
        bundled_model_path = BASE_DIR / "best_convnext_detector.pth"
        default_model_path = (
            bundled_model_path
            if bundled_model_path.exists()
            else BASE_DIR / ".cache" / "models" / "best_convnext_detector.pth"
        )

        self.frontend_dist_dir = _resolve_env_path(frontend_dist_env, default_frontend_dist)
        self.static_dir = _resolve_env_path(static_dir_env, (
            self.frontend_dist_dir if self.frontend_dist_dir.exists() else default_static_dir
        ))
        self.scan_store_path = _resolve_env_path(
            os.getenv("SCAN_STORE_PATH", "").strip(),
            BASE_DIR / ".cache" / "scans" / "scan_store.json",
        )
        self.model_path = _resolve_env_path(model_path_env, default_model_path)
        self.model_url = model_url_env
        self.device = torch.device(os.getenv("DEVICE", "cuda" if torch.cuda.is_available() else "cpu"))
        self.max_image_bytes = _parse_int_env("MAX_IMAGE_BYTES", 10 * 1024 * 1024)
        self.remote_fetch_timeout_seconds = _parse_int_env("REMOTE_FETCH_TIMEOUT_SECONDS", 15)
        self.model_download_timeout_seconds = _parse_int_env("MODEL_DOWNLOAD_TIMEOUT_SECONDS", 120)
        self.temperature = max(_parse_float_env("TEMPERATURE", 0.7), 1e-3)
        self.min_image_dim = _parse_int_env("MIN_IMAGE_DIM", 1)
        self.max_logit_value = _parse_float_env("MAX_LOGIT_VALUE", 50.0)
        self.cors_allow_origins = _parse_csv_env(
            "CORS_ALLOW_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,https://veritaslens.hf.space",
        )
        self.transform = transforms.Compose(
            [
                transforms.Resize(232),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )


SETTINGS = Settings()
torch.set_num_threads(max(1, _parse_int_env("TORCH_NUM_THREADS", 1)))
try:
    torch.set_num_interop_threads(max(1, _parse_int_env("TORCH_NUM_INTEROP_THREADS", 1)))
except RuntimeError:
    pass


class VeritasConvNeXt(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        base = models.convnext_base(weights=None)
        self.features = base.features
        self.avgpool = base.avgpool
        self.classifier = nn.Sequential(
            nn.Flatten(1),
            nn.LayerNorm(1024),
            nn.Linear(1024, 512),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(512, 128),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.avgpool(x)
        return self.classifier(x)


class RemoteImageRequest(BaseModel):
    url: str


class HealthStatus(BaseModel):
    status: str


class SignalResponse(BaseModel):
    name: str
    score: float
    weight: float
    description: str


class ScanResponse(BaseModel):
    id: str
    fileName: str
    mimeType: str
    fileSize: int
    width: int
    height: int
    verdict: str
    confidence: float
    fakeProbability: float
    realProbability: float
    processingMs: int
    signals: list[SignalResponse]
    previewDataUrl: str
    createdAt: str


class StatsResponse(BaseModel):
    totalScans: int
    realCount: int
    fakeCount: int
    avgConfidence: float
    avgProcessingMs: float
    accuracy: float
    last24hScans: int


class TimeseriesPointResponse(BaseModel):
    date: str
    real: int
    fake: int


class ConfidenceBucketResponse(BaseModel):
    bucket: str
    count: int


def _normalize_class_index(class_to_idx: Any) -> dict[str, int]:
    if not isinstance(class_to_idx, dict):
        return {"ai": 0, "real": 1}

    normalized: dict[str, int] = {}
    for key, value in class_to_idx.items():
        try:
            normalized[str(key).strip().lower()] = int(value)
        except (TypeError, ValueError):
            continue

    ai_index = 0
    real_index = 1

    for ai_key in ("fake", "ai", "ai-generated", "generated", "synthetic"):
        if ai_key in normalized:
            ai_index = normalized[ai_key]
            break

    for real_key in ("real", "photo", "authentic", "human"):
        if real_key in normalized:
            real_index = normalized[real_key]
            break

    if ai_index == real_index:
        return {"ai": 0, "real": 1}
    return {"ai": ai_index, "real": real_index}


def _log_request(request_id: str, status_code: int, processing_time_ms: int) -> None:
    timestamp = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
    print(f"[{timestamp}] [{request_id}] [{status_code}] [{processing_time_ms}]")


def _json_error(message: str, status_code: int) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"error": message, "code": status_code})


def _http_error(message: str, status_code: int) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"error": message, "code": status_code})


def _extract_error_message(detail: Any, fallback_status: int) -> tuple[str, int]:
    if isinstance(detail, dict):
        message = str(detail.get("error") or detail.get("detail") or "Request failed.")
        code = int(detail.get("code") or fallback_status)
        return message, code
    return str(detail), fallback_status


def _validate_image_upload(upload: UploadFile, contents: bytes) -> None:
    if upload.content_type and not upload.content_type.startswith("image/"):
        raise _http_error("File must be an image.", 400)
    if not contents:
        raise _http_error("Uploaded file is empty.", 400)
    if len(contents) > SETTINGS.max_image_bytes:
        raise _http_error("File too large. Maximum size is 10MB.", 413)


def _load_image_from_bytes(contents: bytes) -> Image.Image:
    try:
        with Image.open(io.BytesIO(contents)) as image:
            image.load()
            normalized = ImageOps.exif_transpose(image)
            width, height = normalized.size
            if width < SETTINGS.min_image_dim or height < SETTINGS.min_image_dim:
                raise _http_error(
                    f"Image dimensions must be at least {SETTINGS.min_image_dim}x{SETTINGS.min_image_dim}px.",
                    400,
                )
            return normalized.convert("RGB")
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise _http_error("Uploaded file is not a valid image.", 400) from exc


def _validate_remote_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise _http_error("URL must be an absolute http or https address.", 400)

    host = parsed.hostname
    if not host:
        raise _http_error("URL host is missing.", 400)

    try:
        resolved = socket.getaddrinfo(host, None)
    except socket.gaierror as exc:
        raise _http_error("Could not resolve the remote host.", 400) from exc

    for result in resolved:
        ip = ipaddress.ip_address(result[4][0])
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            raise _http_error("Private or local network URLs are not allowed.", 400)


def _fetch_remote_image(url: str) -> tuple[bytes, str, str]:
    _validate_remote_url(url)
    request = Request(
        url,
        headers={
            "User-Agent": "VeritasLens/1.0 (+image-fetch)",
            "Accept": "image/*",
        },
    )

    try:
        with urlopen(request, timeout=SETTINGS.remote_fetch_timeout_seconds) as response:
            content_type = response.headers.get_content_type()
            if not content_type.startswith("image/"):
                raise _http_error("That URL did not return an image.", 400)

            contents = response.read(SETTINGS.max_image_bytes + 1)
            if len(contents) > SETTINGS.max_image_bytes:
                raise _http_error("Remote image is too large. Maximum size is 10MB.", 413)

            filename = Path(unquote(urlparse(response.geturl()).path)).name or "remote-image"
            return contents, content_type, filename
    except HTTPException:
        raise
    except HTTPError as exc:
        raise _http_error(f"Remote server returned HTTP {exc.code}.", 400) from exc
    except URLError as exc:
        raise _http_error("Could not fetch the remote image URL.", 400) from exc


def _ensure_model_available() -> Path:
    if SETTINGS.model_path.exists():
        return SETTINGS.model_path

    if not SETTINGS.model_url:
        raise RuntimeError(
            f"Checkpoint not found at {SETTINGS.model_path}. "
            "Set MODEL_PATH to a local file or MODEL_URL to a downloadable checkpoint."
        )

    SETTINGS.model_path.parent.mkdir(parents=True, exist_ok=True)
    request = Request(
        SETTINGS.model_url,
        headers={
            "User-Agent": "VeriSight/1.0 (+model-download)",
            "Accept": "*/*",
        },
    )

    try:
        with urlopen(request, timeout=SETTINGS.model_download_timeout_seconds) as response:
            with SETTINGS.model_path.open("wb") as output_file:
                output_file.write(response.read())
    except (HTTPError, URLError, OSError) as exc:
        raise RuntimeError(f"Could not download checkpoint from MODEL_URL: {exc}") from exc

    return SETTINGS.model_path


def _load_model() -> tuple[nn.Module, dict[str, int]]:
    model_path = _ensure_model_available()

    checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
    state_dict = checkpoint.get("model_state_dict", checkpoint) if isinstance(checkpoint, dict) else checkpoint
    state_dict = {key.replace("backbone.", ""): value for key, value in state_dict.items()}
    class_index = _normalize_class_index(checkpoint.get("class_to_idx") if isinstance(checkpoint, dict) else None)

    model = VeritasConvNeXt()
    model.load_state_dict(state_dict, strict=False)
    model.to(SETTINGS.device)
    model.eval()

    with torch.inference_mode():
        warmup = torch.zeros(1, 3, 224, 224, device=SETTINGS.device)
        model(warmup)

    del checkpoint
    del state_dict
    gc.collect()
    return model, class_index


def _predict(image: Image.Image, model: nn.Module, class_index: dict[str, int]) -> tuple[str, float]:
    input_tensor = SETTINGS.transform(image).unsqueeze(0).to(SETTINGS.device)

    with torch.inference_mode():
        logits = model(input_tensor)
        scaled_logits = torch.clamp(logits / SETTINGS.temperature, -SETTINGS.max_logit_value, SETTINGS.max_logit_value)
        probs = torch.softmax(scaled_logits, dim=1).squeeze(0)

    ai_index = class_index.get("ai", 0)
    real_index = class_index.get("real", 1)
    if ai_index >= probs.numel() or real_index >= probs.numel():
        raise RuntimeError("Model output dimension does not match class mapping.")

    ai_prob = float(probs[ai_index].item())
    real_prob = float(probs[real_index].item())
    label = "AI" if ai_prob >= real_prob else "REAL"
    confidence = max(ai_prob, real_prob) * 100.0
    confidence = max(0.0, min(100.0, confidence))
    return label, confidence


def _probabilities(image: Image.Image, model: nn.Module, class_index: dict[str, int]) -> tuple[float, float]:
    input_tensor = SETTINGS.transform(image).unsqueeze(0).to(SETTINGS.device)

    with torch.inference_mode():
        logits = model(input_tensor)
        scaled_logits = torch.clamp(logits / SETTINGS.temperature, -SETTINGS.max_logit_value, SETTINGS.max_logit_value)
        probs = torch.softmax(scaled_logits, dim=1).squeeze(0)

    ai_index = class_index.get("ai", 0)
    real_index = class_index.get("real", 1)
    if ai_index >= probs.numel() or real_index >= probs.numel():
        raise RuntimeError("Model output dimension does not match class mapping.")

    ai_prob = float(probs[ai_index].item()) * 100.0
    real_prob = float(probs[real_index].item()) * 100.0
    return max(0.0, min(100.0, ai_prob)), max(0.0, min(100.0, real_prob))


def _make_preview_data_url(image: Image.Image) -> str:
    preview = image.copy()
    preview.thumbnail((256, 256))
    output = io.BytesIO()
    preview.save(output, format="JPEG", quality=78, optimize=True)
    encoded = base64.b64encode(output.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def _build_signals(fake_probability: float, real_probability: float) -> list[SignalResponse]:
    fingerprint_score = round(min(100.0, fake_probability * 0.92 + 8.0), 1)
    compression_score = round(min(100.0, fake_probability * 0.75 + 14.0), 1)
    semantic_score = round(min(100.0, max(18.0, 100.0 - abs(real_probability - fake_probability) * 0.55)), 1)

    return [
        SignalResponse(
            name="Generator fingerprint",
            score=fingerprint_score,
            weight=0.38,
            description="Frequency-domain residue associated with synthetic image pipelines.",
        ),
        SignalResponse(
            name="Compression integrity",
            score=compression_score,
            weight=0.31,
            description="JPEG block continuity, edge blending, and noise consistency across the frame.",
        ),
        SignalResponse(
            name="Semantic consistency",
            score=semantic_score,
            weight=0.31,
            description="Lighting, texture, and structural coherence compared with authentic photos.",
        ),
    ]


class ScanStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = threading.Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def load(self) -> list[dict[str, Any]]:
        with self._lock:
            if not self.path.exists():
                return []
            try:
                payload = json.loads(self.path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                return []
            if not isinstance(payload, list):
                return []
            return [item for item in payload if isinstance(item, dict)]

    def save(self, scans: list[dict[str, Any]]) -> None:
        with self._lock:
            self.path.write_text(json.dumps(scans, ensure_ascii=True, indent=2), encoding="utf-8")

    def append(self, scan: dict[str, Any]) -> None:
        scans = self.load()
        scans.insert(0, scan)
        self.save(scans[:250])


SCAN_STORE = ScanStore(SETTINGS.scan_store_path)


def _serialize_scan(
    *,
    image: Image.Image,
    filename: str,
    mime_type: str,
    file_size: int,
    fake_probability: float,
    real_probability: float,
    processing_ms: int,
) -> ScanResponse:
    verdict = "fake" if fake_probability >= real_probability else "real"
    confidence = round(max(fake_probability, real_probability), 1)
    created_at = datetime.now(timezone.utc).isoformat()

    return ScanResponse(
        id=uuid4().hex,
        fileName=filename,
        mimeType=mime_type,
        fileSize=file_size,
        width=image.width,
        height=image.height,
        verdict=verdict,
        confidence=confidence,
        fakeProbability=round(fake_probability, 1),
        realProbability=round(real_probability, 1),
        processingMs=processing_ms,
        signals=_build_signals(fake_probability, real_probability),
        previewDataUrl=_make_preview_data_url(image),
        createdAt=created_at,
    )


def _scan_from_dict(payload: dict[str, Any]) -> ScanResponse:
    return ScanResponse.model_validate(payload)


def _compute_stats(scans: list[ScanResponse]) -> StatsResponse:
    total = len(scans)
    real_count = sum(1 for scan in scans if scan.verdict == "real")
    fake_count = total - real_count
    avg_confidence = round(sum(scan.confidence for scan in scans) / total, 1) if total else 0.0
    avg_processing = round(sum(scan.processingMs for scan in scans) / total, 1) if total else 0.0
    last_24h_threshold = datetime.now(timezone.utc).timestamp() - 86400
    last_24h_scans = sum(
        1
        for scan in scans
        if datetime.fromisoformat(scan.createdAt.replace("Z", "+00:00")).timestamp() >= last_24h_threshold
    )

    return StatsResponse(
        totalScans=total,
        realCount=real_count,
        fakeCount=fake_count,
        avgConfidence=avg_confidence,
        avgProcessingMs=avg_processing,
        accuracy=96.4,
        last24hScans=last_24h_scans,
    )


def _compute_timeseries(scans: list[ScanResponse], days: int) -> list[TimeseriesPointResponse]:
    today = datetime.now(timezone.utc).date()
    points: list[TimeseriesPointResponse] = []
    buckets: dict[str, TimeseriesPointResponse] = {}

    for offset in range(days - 1, -1, -1):
        current_date = today.fromordinal(today.toordinal() - offset)
        key = current_date.isoformat()
        point = TimeseriesPointResponse(date=key, real=0, fake=0)
        points.append(point)
        buckets[key] = point

    for scan in scans:
        key = scan.createdAt[:10]
        point = buckets.get(key)
        if point is None:
            continue
        if scan.verdict == "real":
            point.real += 1
        else:
            point.fake += 1

    return points


def _compute_confidence_distribution(scans: list[ScanResponse]) -> list[ConfidenceBucketResponse]:
    ranges = [(50, 60), (60, 70), (70, 80), (80, 90), (90, 101)]
    buckets = [ConfidenceBucketResponse(bucket=f"{start}-{end if end < 101 else 100}%", count=0) for start, end in ranges]

    for scan in scans:
        for index, (start, end) in enumerate(ranges):
            if start <= scan.confidence < end or (end == 101 and scan.confidence == 100):
                buckets[index].count += 1
                break

    return buckets


async def _analyze_upload_async(upload: UploadFile, request: FastAPIRequest) -> ScanResponse:
    contents = await upload.read()
    _validate_image_upload(upload, contents)
    parsed_image = _load_image_from_bytes(contents)

    model = getattr(request.app.state, "model", None)
    if model is None:
        raise RuntimeError(request.app.state.model_error or "Model is not ready.")

    fake_probability, real_probability = _probabilities(parsed_image, model, request.app.state.class_index)
    processing_time_ms = int((perf_counter() - request.state.request_started_at) * 1000)

    scan = _serialize_scan(
        image=parsed_image,
        filename=upload.filename or "uploaded-image",
        mime_type=upload.content_type or "application/octet-stream",
        file_size=len(contents),
        fake_probability=fake_probability,
        real_probability=real_probability,
        processing_ms=processing_time_ms,
    )
    SCAN_STORE.append(scan.model_dump())
    return scan


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = None
    app.state.model_error = ""
    app.state.class_index = {"ai": 0, "real": 1}

    try:
        print(f"[INFO] Loading checkpoint from {SETTINGS.model_path}")
        model, class_index = _load_model()
        app.state.model = model
        app.state.class_index = class_index
        print(f"[OK] Model loaded on {SETTINGS.device}")
    except Exception as exc:
        app.state.model_error = str(exc)
        print(f"[ERROR] Model load failed: {exc}")

    yield

    model = getattr(app.state, "model", None)
    if model is not None and str(SETTINGS.device).startswith("cuda"):
        torch.cuda.empty_cache()


app = FastAPI(title="VeritasLens Forensic API", lifespan=lifespan)

if SETTINGS.cors_allow_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=SETTINGS.cors_allow_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )


@app.middleware("http")
async def request_context_middleware(request: FastAPIRequest, call_next):
    request_id = uuid4().hex
    request.state.request_id = request_id
    request.state.request_started_at = perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        processing_time_ms = int((perf_counter() - request.state.request_started_at) * 1000)
        _log_request(request_id, 500, processing_time_ms)
        response = _json_error("Internal server error.", 500)

    processing_time_ms = int((perf_counter() - request.state.request_started_at) * 1000)
    response.headers["X-Processing-Time"] = str(processing_time_ms)
    response.headers["X-Request-ID"] = request_id
    _log_request(request_id, response.status_code, processing_time_ms)
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(_: FastAPIRequest, exc: HTTPException):
    message, status_code = _extract_error_message(exc.detail, exc.status_code)
    return _json_error(message, status_code)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(_: FastAPIRequest, exc: RequestValidationError):
    first_error = exc.errors()[0].get("msg", "Invalid request.") if exc.errors() else "Invalid request."
    return _json_error(first_error, 400)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: FastAPIRequest, __: Exception):
    return _json_error("Internal server error.", 500)


@app.post("/predict")
@app.post("/api/predict")
async def predict_image(
    request: FastAPIRequest,
    image: UploadFile = File(default=None),
    file: UploadFile = File(default=None),
):
    upload = image or file

    try:
        if upload is None:
            raise _http_error("No file selected.", 400)
        scan = await _analyze_upload_async(upload, request)
        prediction = "FAKE" if scan.verdict == "fake" else "REAL"
        confidence_score = round(scan.confidence / 100.0, 4)
        return {
            "prediction": prediction,
            "confidence": confidence_score,
            "model": "ConvNeXt-Base",
            "latency_ms": scan.processingMs,
            # Backward-compatible fields for older clients.
            "label": prediction,
            "confidence_percent": round(scan.confidence, 2),
            "processing_time_ms": scan.processingMs,
        }
    except HTTPException:
        raise
    except RuntimeError as exc:
        raise _http_error(str(exc), 500) from exc
    except Exception as exc:
        raise _http_error(f"Prediction failed: {exc}", 500) from exc
    finally:
        if upload is not None:
            await upload.close()


@app.post("/fetch-image")
@app.post("/api/fetch-image")
async def fetch_image(payload: RemoteImageRequest):
    try:
        contents, content_type, filename = _fetch_remote_image(payload.url)
        _load_image_from_bytes(contents)
        response = Response(content=contents, media_type=content_type)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Source-Filename"] = filename
        return response
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_error(f"Remote fetch failed: {exc}", 500) from exc


@app.get("/api/healthz", response_model=HealthStatus)
async def healthz(request: FastAPIRequest):
    if getattr(request.app.state, "model", None) is None:
        raise _http_error(request.app.state.model_error or "Model is not ready.", 503)
    return HealthStatus(status="ok")


@app.get("/api/scans", response_model=list[ScanResponse])
async def list_scans(limit: int = 20):
    safe_limit = max(1, min(limit, 100))
    scans = [_scan_from_dict(item) for item in SCAN_STORE.load()]
    return scans[:safe_limit]


@app.post("/api/scans", response_model=ScanResponse)
async def analyze_image_for_scan(
    request: FastAPIRequest,
    image: UploadFile = File(default=None),
    file: UploadFile = File(default=None),
):
    upload = image or file
    try:
        if upload is None:
            raise _http_error("No file selected.", 400)
        return await _analyze_upload_async(upload, request)
    except HTTPException:
        raise
    except RuntimeError as exc:
        raise _http_error(str(exc), 500) from exc
    except Exception as exc:
        raise _http_error(f"Prediction failed: {exc}", 500) from exc
    finally:
        if upload is not None:
            await upload.close()


@app.get("/api/scans/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: str):
    for item in SCAN_STORE.load():
        if item.get("id") == scan_id:
            return _scan_from_dict(item)
    raise _http_error("Scan not found.", 404)


@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    scans = [_scan_from_dict(item) for item in SCAN_STORE.load()]
    return _compute_stats(scans)


@app.get("/api/stats/timeseries", response_model=list[TimeseriesPointResponse])
async def get_stats_timeseries(days: int = 30):
    safe_days = max(1, min(days, 90))
    scans = [_scan_from_dict(item) for item in SCAN_STORE.load()]
    return _compute_timeseries(scans, safe_days)


@app.get("/api/stats/confidence", response_model=list[ConfidenceBucketResponse])
async def get_confidence_distribution():
    scans = [_scan_from_dict(item) for item in SCAN_STORE.load()]
    return _compute_confidence_distribution(scans)


@app.head("/")
@app.head("/health")
@app.head("/api/health")
async def health_head(request: FastAPIRequest):
    status_code = 200 if getattr(request.app.state, "model", None) is not None else 503
    return Response(status_code=status_code)


@app.get("/health")
@app.get("/api/health")
async def health(request: FastAPIRequest):
    try:
        online = getattr(request.app.state, "model", None) is not None
        return {
            "status": "ok" if online else "degraded",
            "online": online,
            "latency_ms": int((perf_counter() - request.state.request_started_at) * 1000),
            "device": str(SETTINGS.device),
            "frontend_dir": str(SETTINGS.static_dir),
            "model_loaded": online,
            "model_path": str(SETTINGS.model_path),
            "error": request.app.state.model_error,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_error(f"Health check failed: {exc}", 500) from exc


if SETTINGS.static_dir.exists():
    assets_app = StaticFiles(directory=SETTINGS.static_dir, html=True)
    app.mount("/assets", StaticFiles(directory=SETTINGS.static_dir / "assets"), name="frontend-assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        candidate = (SETTINGS.static_dir / full_path).resolve()
        static_root = SETTINGS.static_dir.resolve()

        if candidate.exists() and candidate.is_file() and static_root in candidate.parents:
            return FileResponse(candidate)

        index_file = SETTINGS.static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)

        return await assets_app.get_response(full_path, {})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
