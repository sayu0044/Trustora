from __future__ import annotations

import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = BACKEND_DIR / "artifacts"
DEFAULT_DATASET_PATH = PROJECT_ROOT / "sms_spam_indo.csv"

MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"
MODEL_COMPARISON_PATH = ARTIFACTS_DIR / "model_comparison.json"
DATASET_SUMMARY_PATH = ARTIFACTS_DIR / "dataset_summary.json"
CONFUSION_MATRIX_PATH = ARTIFACTS_DIR / "confusion_matrix.png"

SUPPORTED_LABELS = {"ham", "spam"}
MAX_MESSAGE_LENGTH = 5000
MAX_BATCH_BYTES = 2 * 1024 * 1024
DISCLAIMER = "Hasil ini merupakan prediksi awal dan bukan keputusan mutlak."


def get_dataset_path() -> Path:
    return Path(os.getenv("DATASET_PATH", str(DEFAULT_DATASET_PATH))).expanduser()


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]
