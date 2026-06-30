from fastapi.testclient import TestClient

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


def test_predict_endpoint_schema():
    response = client.post("/api/predict", json={"message": "Selamat anda mendapatkan hadiah klik link"})
    assert response.status_code in {200, 503}
    if response.status_code == 200:
        body = response.json()
        assert body["raw_label"] in {"ham", "spam"}
        assert body["category"] in {"Normal", "Spam"}
        assert isinstance(body["confidence"], float)

