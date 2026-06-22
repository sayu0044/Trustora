# Trustora Backend

FastAPI backend dan pipeline machine learning lokal untuk deteksi spam Indonesia.

```bash
pip install -r backend/requirements.txt
python -m backend.app.ml.train
uvicorn backend.app.main:app --reload
pytest backend/tests
```

