from pathlib import Path

from backend.app.ml.train import load_and_clean_dataset, train
from backend.app.ml.model_registry import load_model


def test_dataset_read_and_labels_valid():
    data, summary = load_and_clean_dataset()
    assert len(data) == summary["rows_after_cleaning"]
    assert set(data["Kategori"].unique()) == {"ham", "spam"}


def test_train_saves_model_and_predicts_raw_text():
    metrics = train()
    assert metrics["best_model"]
    assert Path("backend/artifacts/model.joblib").exists()
    payload = load_model()
    prediction = payload["pipeline"].predict(["Selamat anda menang hadiah klik link"])[0]
    assert prediction in {"ham", "spam"}

