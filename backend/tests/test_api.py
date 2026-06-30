from fastapi.testclient import TestClient
import pytest

from backend.app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_empty_validation():
    response = client.post("/api/predict", json={"message": ""})
    assert response.status_code == 422


def test_train_status_endpoint():
    response = client.get("/api/train/status")
    assert response.status_code == 200
    body = response.json()
    assert body["state"] in {"idle", "running", "success", "error"}
    assert isinstance(body["model_ready"], bool)


@pytest.mark.parametrize(
    "origin",
    [
        "http://localhost:5173",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://127.0.0.1:5176",
        "http://[::1]:5178",
    ],
)
def test_train_preflight_allows_local_vite_dev_origins(origin: str):
    response = client.options(
        "/api/train",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_train_preflight_rejects_non_vite_dev_origin():
    response = client.options(
        "/api/train",
        headers={
            "Origin": "http://localhost:5180",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 400


def test_predict_endpoint_schema():
    response = client.post("/api/predict", json={"message": "Selamat anda mendapatkan hadiah klik link"})
    assert response.status_code in {200, 503}
    if response.status_code == 200:
        body = response.json()
        assert body["raw_label"] in {"ham", "spam"}
        assert body["category"] in {"Normal", "Spam"}
        assert isinstance(body["confidence"], float)

