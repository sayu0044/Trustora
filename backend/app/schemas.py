from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from backend.app.config import MAX_MESSAGE_LENGTH


RiskLevel = Literal["Rendah", "Sedang", "Tinggi"]
RawLabel = Literal["ham", "spam"]


class PredictRequest(BaseModel):
    message: str = Field(..., max_length=MAX_MESSAGE_LENGTH)

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Pesan tidak boleh kosong.")
        return value


class PredictResponse(BaseModel):
    raw_label: RawLabel
    category: Literal["Normal", "Spam"]
    confidence: float
    risk_level: RiskLevel
    spam_indication: str
    suspicious_keywords: list[str]
    advice: list[str]
    disclaimer: str


class HealthResponse(BaseModel):
    status: Literal["ok"]
    model_loaded: bool
    model_name: str | None = None


class MetricsResponse(BaseModel):
    best_model: str | None
    metrics: dict[str, Any]
    model_comparison: dict[str, Any]
    dataset_summary: dict[str, Any]
    confusion_matrix_url: str | None

class BatchPrediction(BaseModel):
    message: str
    category: str
    confidence: float
    risk_level: str
    spam_indication: str
    suspicious_keywords: list[str]


class BatchResponse(BaseModel):
    total: int
    results: list[BatchPrediction]
    summary: dict[str, Any]

