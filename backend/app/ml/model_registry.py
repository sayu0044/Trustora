from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib

from backend.app.config import MODEL_PATH, METRICS_PATH


def save_model(payload: dict[str, Any], path: Path = MODEL_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(payload, path)


def load_model(path: Path = MODEL_PATH) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Model belum tersedia di {path}. Jalankan training terlebih dahulu.")
    return joblib.load(path)


def load_model_name() -> str | None:
    if not METRICS_PATH.exists():
        return None
    with METRICS_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle).get("best_model")

