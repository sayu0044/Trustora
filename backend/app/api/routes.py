from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.app.ml.model_registry import load_model_name
from backend.app.schemas import BatchResponse, HealthResponse, MetricsResponse, PredictRequest, PredictResponse
from backend.app.services.predictor import get_metrics_payload, get_model_payload, parse_batch_csv, predict_batch, predict_message


router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    try:
        payload = get_model_payload()
        return HealthResponse(status="ok", model_loaded=True, model_name=payload.get("model_name"))
    except FileNotFoundError:
        return HealthResponse(status="ok", model_loaded=False, model_name=load_model_name())


@router.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    try:
        return PredictResponse(**predict_message(request.message))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/metrics", response_model=MetricsResponse)
def metrics() -> MetricsResponse:
    return MetricsResponse(**get_metrics_payload())


@router.post("/predict-batch", response_model=BatchResponse)
async def predict_batch_endpoint(file: UploadFile = File(...)) -> BatchResponse:
    try:
        content = await file.read()
        frame = parse_batch_csv(content, file.filename or "")
        return BatchResponse(**predict_batch(frame))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

