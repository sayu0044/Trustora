from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from backend.app.config import (
    ARTIFACTS_DIR,
    CONFUSION_MATRIX_PATH,
    DATASET_SUMMARY_PATH,
    METRICS_PATH,
    MODEL_COMPARISON_PATH,
    SUPPORTED_LABELS,
    get_dataset_path,
)
from backend.app.ml.model_registry import save_model
from backend.app.services.preprocessing import preprocess_text


def _detect_columns(df: pd.DataFrame) -> tuple[str, str]:
    normalized = {column.strip().lower(): column for column in df.columns}
    if "pesan" not in normalized or "kategori" not in normalized:
        raise ValueError("Dataset harus memiliki kolom Pesan dan Kategori.")
    return normalized["pesan"], normalized["kategori"]


def load_and_clean_dataset(dataset_path: Path | None = None) -> tuple[pd.DataFrame, dict[str, Any]]:
    path = dataset_path or get_dataset_path()
    if not path.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan. Letakkan file di {path} atau set DATASET_PATH.")

    raw = pd.read_csv(path)
    raw.columns = [column.strip() for column in raw.columns]
    text_col, label_col = _detect_columns(raw)

    before_rows = int(len(raw))
    labels = raw[label_col].astype(str).str.strip().str.lower()
    invalid_labels = sorted(set(labels.unique()) - SUPPORTED_LABELS)
    if invalid_labels:
        raise ValueError(f"Label tidak didukung: {invalid_labels}")

    lengths = raw[text_col].astype(str).str.len()
    cleaned = raw[[label_col, text_col]].copy()
    cleaned[label_col] = labels
    cleaned[text_col] = cleaned[text_col].astype(str)
    empty_mask = (cleaned[text_col].str.strip() == "") | (cleaned[label_col].str.strip() == "")
    cleaned = cleaned.loc[~empty_mask].drop_duplicates(subset=[label_col, text_col]).reset_index(drop=True)
    cleaned = cleaned.rename(columns={label_col: "Kategori", text_col: "Pesan"})

    length_distribution = pd.cut(lengths, bins=[0, 50, 100, 150, 250, 500, np.inf]).value_counts().sort_index()
    label_counts = cleaned["Kategori"].value_counts().to_dict()
    summary = {
        "dataset_path": str(path),
        "columns": list(raw.columns),
        "dtypes": {column: str(dtype) for column, dtype in raw.dtypes.items()},
        "rows_before_cleaning": before_rows,
        "rows_after_cleaning": int(len(cleaned)),
        "removed_empty_rows": int(empty_mask.sum()),
        "duplicate_rows": int(raw.duplicated().sum()),
        "duplicate_text_label_rows": int(raw.duplicated(subset=[label_col, text_col]).sum()),
        "missing_values": {column: int(value) for column, value in raw.isna().sum().to_dict().items()},
        "label_counts": {key: int(value) for key, value in label_counts.items()},
        "label_percentages": {key: round(float(value / len(cleaned) * 100), 2) for key, value in label_counts.items()},
        "average_message_length": round(float(lengths.mean()), 2),
        "median_message_length": round(float(lengths.median()), 2),
        "min_message_length": int(lengths.min()),
        "max_message_length": int(lengths.max()),
        "shortest_message": str(raw.loc[int(lengths.idxmin()), text_col]),
        "longest_message": str(raw.loc[int(lengths.idxmax()), text_col]),
        "length_distribution": {str(interval): int(value) for interval, value in length_distribution.to_dict().items()},
        "supported_labels": sorted(SUPPORTED_LABELS),
    }
    return cleaned, summary


def _build_pipeline(model: object) -> Pipeline:
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            preprocessor=preprocess_text,
            tokenizer=str.split,
            token_pattern=None,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95,
            sublinear_tf=True,
        )),
        ("model", model),
    ])


def _metric_bundle(y_true: pd.Series, y_pred: np.ndarray, labels: list[str]) -> dict[str, Any]:
    report = classification_report(y_true, y_pred, labels=labels, output_dict=True, zero_division=0)
    matrix = confusion_matrix(y_true, y_pred, labels=labels)
    macro = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    weighted = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "spam_precision": float(report["spam"]["precision"]),
        "spam_recall": float(report["spam"]["recall"]),
        "spam_f1": float(report["spam"]["f1-score"]),
        "macro_f1": float(macro[2]),
        "weighted_f1": float(weighted[2]),
        "classification_report": report,
        "confusion_matrix": matrix.tolist(),
        "true_negative_ham": int(matrix[0][0]),
        "false_positive_spam": int(matrix[0][1]),
        "false_negative_spam": int(matrix[1][0]),
        "true_positive_spam": int(matrix[1][1]),
    }


def _plot_confusion_matrix(matrix: list[list[int]], output_path: Path) -> None:
    fig, ax = plt.subplots(figsize=(5, 4))
    image = ax.imshow(matrix, cmap="Blues")
    ax.set_xticks([0, 1], labels=["ham", "spam"])
    ax.set_yticks([0, 1], labels=["ham", "spam"])
    ax.set_xlabel("Prediksi")
    ax.set_ylabel("Aktual")
    for row in range(2):
        for col in range(2):
            ax.text(col, row, matrix[row][col], ha="center", va="center", color="black")
    fig.colorbar(image)
    fig.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, dpi=160)
    plt.close(fig)


def train() -> dict[str, Any]:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    dataset, dataset_summary = load_and_clean_dataset()
    DATASET_SUMMARY_PATH.write_text(json.dumps(dataset_summary, indent=2, ensure_ascii=False), encoding="utf-8")

    x_train, x_test, y_train, y_test = train_test_split(
        dataset["Pesan"], dataset["Kategori"], test_size=0.2, random_state=42, stratify=dataset["Kategori"]
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    candidates = {
        "Multinomial Naive Bayes": (_build_pipeline(MultinomialNB()), {"model__alpha": [0.1, 0.5, 1.0]}),
        "Logistic Regression": (_build_pipeline(LogisticRegression(max_iter=1200, class_weight="balanced")), {"model__C": [0.5, 1.0, 2.0]}),
        "Linear SVM": (_build_pipeline(CalibratedClassifierCV(LinearSVC(class_weight="balanced", random_state=42))), {"model__estimator__C": [0.5, 1.0, 2.0]}),
    }

    comparisons: dict[str, Any] = {}
    fitted: dict[str, Pipeline] = {}
    labels = ["ham", "spam"]
    started = time.perf_counter()
    for name, (pipeline, params) in candidates.items():
        model_start = time.perf_counter()
        search = GridSearchCV(pipeline, params, scoring="f1_macro", cv=cv, n_jobs=-1, refit=True)
        search.fit(x_train, y_train)
        predictions = search.predict(x_test)
        bundle = _metric_bundle(y_test, predictions, labels)
        bundle["best_params"] = search.best_params_
        bundle["cv_macro_f1_mean"] = float(search.best_score_)
        bundle["training_seconds"] = round(time.perf_counter() - model_start, 3)
        comparisons[name] = bundle
        fitted[name] = search.best_estimator_

    best_model = max(
        comparisons,
        key=lambda model_name: (
            comparisons[model_name]["spam_f1"],
            comparisons[model_name]["spam_recall"],
            comparisons[model_name]["macro_f1"],
            comparisons[model_name]["accuracy"],
        ),
    )
    best_metrics = comparisons[best_model]
    best_metrics["best_model_reason"] = (
        "Model dipilih berdasarkan prioritas F1 spam, recall spam, macro F1, lalu accuracy "
        "untuk menekan risiko false negative pada pesan spam."
    )
    metrics = {
        "best_model": best_model,
        "test_metrics": best_metrics,
        "training_total_seconds": round(time.perf_counter() - started, 3),
        "labels": labels,
    }
    save_model({"pipeline": fitted[best_model], "model_name": best_model, "labels": labels})
    MODEL_COMPARISON_PATH.write_text(json.dumps(comparisons, indent=2, ensure_ascii=False), encoding="utf-8")
    METRICS_PATH.write_text(json.dumps(metrics, indent=2, ensure_ascii=False), encoding="utf-8")
    _plot_confusion_matrix(best_metrics["confusion_matrix"], CONFUSION_MATRIX_PATH)
    return metrics


if __name__ == "__main__":
    result = train()
    print(json.dumps(result, indent=2, ensure_ascii=False))

