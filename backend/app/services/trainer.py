from __future__ import annotations

import logging
import threading
from datetime import datetime, timezone
from typing import Any, Literal

from backend.app.config import MODEL_PATH
from backend.app.ml.model_registry import load_model_name
from backend.app.services.predictor import clear_model_cache

logger = logging.getLogger(__name__)

TrainingState = Literal["idle", "running", "success", "error"]

_lock = threading.Lock()
_thread: threading.Thread | None = None
_status: dict[str, Any] = {
    "state": "idle",
    "message": None,
    "best_model": None,
    "started_at": None,
    "finished_at": None,
    "duration_seconds": None,
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def model_ready() -> bool:
    return MODEL_PATH.exists()


def get_status() -> dict[str, Any]:
    """Returns a snapshot of the current training status plus model readiness."""
    with _lock:
        snapshot = dict(_status)
    snapshot["model_ready"] = model_ready()
    if snapshot["best_model"] is None:
        snapshot["best_model"] = load_model_name()
    return snapshot


def _run_training() -> None:
    # Imported lazily: training pulls in scikit-learn and matplotlib, which are
    # heavy and not needed for normal prediction requests.
    from backend.app.ml.train import train

    start = datetime.now(timezone.utc)
    try:
        metrics = train()
        clear_model_cache()
        with _lock:
            _status.update(
                state="success",
                message="Training selesai. Model siap digunakan.",
                best_model=metrics.get("best_model"),
                finished_at=_now(),
                duration_seconds=metrics.get("training_total_seconds"),
            )
        logger.info("Training selesai. Model terbaik: %s", metrics.get("best_model"))
    except Exception as exc:  # noqa: BLE001 - surface a safe message, log the detail.
        logger.exception("Training gagal dijalankan.")
        duration = round((datetime.now(timezone.utc) - start).total_seconds(), 3)
        with _lock:
            _status.update(
                state="error",
                message=f"Training gagal: {exc}",
                finished_at=_now(),
                duration_seconds=duration,
            )


def start_training() -> dict[str, Any]:
    """Starts training in a background thread.

    Raises RuntimeError if a training run is already in progress (single-flight).
    """
    global _thread
    with _lock:
        if _status["state"] == "running":
            raise RuntimeError("Training sedang berjalan. Tunggu hingga selesai.")
        _status.update(
            state="running",
            message="Training sedang berjalan.",
            best_model=None,
            started_at=_now(),
            finished_at=None,
            duration_seconds=None,
        )
        _thread = threading.Thread(target=_run_training, name="trustora-training", daemon=True)
        _thread.start()
    return get_status()
