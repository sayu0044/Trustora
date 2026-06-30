from __future__ import annotations

import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = BACKEND_DIR / "artifacts"
DATASET_FILENAME = "sms_spam_indo.csv"
DEFAULT_DATASET_PATH = PROJECT_ROOT / DATASET_FILENAME
# The dataset currently ships inside the csv/ folder; keep it as a fallback so
# training works without requiring DATASET_PATH to be set explicitly.
CSV_DATASET_PATH = PROJECT_ROOT / "csv" / DATASET_FILENAME

MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"
MODEL_COMPARISON_PATH = ARTIFACTS_DIR / "model_comparison.json"
DATASET_SUMMARY_PATH = ARTIFACTS_DIR / "dataset_summary.json"
CONFUSION_MATRIX_PATH = ARTIFACTS_DIR / "confusion_matrix.png"

SUPPORTED_LABELS = {"ham", "spam"}
MAX_MESSAGE_LENGTH = 5000
MAX_BATCH_BYTES = 2 * 1024 * 1024
DISCLAIMER = "Hasil ini merupakan prediksi awal dan bukan keputusan mutlak."
LOCAL_DEV_CORS_ORIGIN_REGEX = r"^http://(localhost|127\.0\.0\.1|\[::1\]):517[3-9]$"


def get_dataset_path() -> Path:
    override = os.getenv("DATASET_PATH")
    if override:
        return Path(override).expanduser()
    if not DEFAULT_DATASET_PATH.exists() and CSV_DATASET_PATH.exists():
        return CSV_DATASET_PATH
    return DEFAULT_DATASET_PATH


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://[::1]:5173")
    return list(dict.fromkeys(origin.strip() for origin in raw.split(",") if origin.strip()))


def get_cors_origin_regex() -> str:
    return LOCAL_DEV_CORS_ORIGIN_REGEX
