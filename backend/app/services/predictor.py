from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import pandas as pd

from backend.app.config import (
    CONFUSION_MATRIX_PATH,
    DATASET_SUMMARY_PATH,
    DISCLAIMER,
    MAX_BATCH_BYTES,
    METRICS_PATH,
    MODEL_COMPARISON_PATH,
)
from backend.app.ml.model_registry import load_model
from backend.app.services.keyword_analyzer import analyze_keywords, spam_indication_for
from backend.app.services.risk_analyzer import build_advice, determine_risk


@lru_cache(maxsize=1)
def get_model_payload() -> dict[str, Any]:
    return load_model()


def clear_model_cache() -> None:
    get_model_payload.cache_clear()


def predict_message(message: str) -> dict[str, Any]:
    payload = get_model_payload()
    pipeline = payload["pipeline"]
    probabilities = pipeline.predict_proba([message])[0]
    classes = list(pipeline.classes_)
    best_index = int(probabilities.argmax())
    raw_label = str(classes[best_index])
    confidence = float(probabilities[best_index])
    keyword_result = analyze_keywords(message)
    risk_level = determine_risk(raw_label, confidence, keyword_result)
    indication = spam_indication_for(keyword_result) if raw_label == "spam" else "Tidak ada indikasi spam"
    return {
        "raw_label": raw_label,
        "category": "Spam" if raw_label == "spam" else "Normal",
        "confidence": round(confidence, 4),
        "risk_level": risk_level,
        "spam_indication": indication,
        "suspicious_keywords": keyword_result.all_keywords,
        "advice": build_advice(risk_level, keyword_result),
        "disclaimer": DISCLAIMER,
    }


def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def get_metrics_payload() -> dict[str, Any]:
    metrics = load_json(METRICS_PATH)
    return {
        "best_model": metrics.get("best_model"),
        "metrics": metrics,
        "model_comparison": load_json(MODEL_COMPARISON_PATH),
        "dataset_summary": load_json(DATASET_SUMMARY_PATH),
        "confusion_matrix_url": "/artifacts/confusion_matrix.png" if CONFUSION_MATRIX_PATH.exists() else None,
    }


def parse_batch_csv(content: bytes, filename: str) -> pd.DataFrame:
    if len(content) > MAX_BATCH_BYTES:
        raise ValueError("Ukuran file terlalu besar. Maksimal 2 MB.")
    if not filename.lower().endswith(".csv"):
        raise ValueError("Format file harus CSV.")
    from io import BytesIO

    frame = pd.read_csv(BytesIO(content))
    normalized = {column.strip().lower(): column for column in frame.columns}
    if "pesan" not in normalized:
        raise ValueError("CSV harus memiliki kolom Pesan.")
    return frame.rename(columns={normalized["pesan"]: "Pesan"})


def predict_batch(frame: pd.DataFrame) -> dict[str, Any]:
    results = []
    for message in frame["Pesan"].fillna("").astype(str):
        if not message.strip():
            continue
        prediction = predict_message(message)
        results.append({
            "message": message,
            "category": prediction["category"],
            "confidence": prediction["confidence"],
            "risk_level": prediction["risk_level"],
            "spam_indication": prediction["spam_indication"],
            "suspicious_keywords": prediction["suspicious_keywords"],
        })
    categories = pd.Series([item["category"] for item in results]).value_counts().to_dict() if results else {}
    risks = pd.Series([item["risk_level"] for item in results]).value_counts().to_dict() if results else {}
    return {"total": len(results), "results": results, "summary": {"categories": categories, "risks": risks}}

