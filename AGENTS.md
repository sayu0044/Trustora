# Trustora Agent Notes

## Struktur Proyek

- `backend/app/main.py`: entrypoint FastAPI.
- `backend/app/api/routes.py`: endpoint `/api/health`, `/api/predict`, `/api/metrics`, `/api/predict-batch`.
- `backend/app/ml/train.py`: loading dataset, cleaning in-memory, training, evaluasi, dan penulisan artifacts.
- `backend/app/services/preprocessing.py`: preprocessing NLP yang masuk ke scikit-learn pipeline.
- `backend/app/services/keyword_analyzer.py`: indikator promosi/penipuan berbasis frasa.
- `backend/app/services/risk_analyzer.py`: aturan risiko rendah/sedang/tinggi.
- `frontend/src`: React + Vite + TypeScript UI.

## Perintah Utama

Training:

```bash
python -m backend.app.ml.train
```

Backend:

```bash
uvicorn backend.app.main:app --reload
```

Backend test:

```bash
pytest backend/tests
```

Python syntax/import check:

```bash
python -m compileall backend
python -c "from backend.app.main import app; print(app.title)"
```

Frontend:

```bash
cd frontend
npm install
npm run test
npm run typecheck
npm run build
```

## Aturan Penting

- Jangan mengubah file asli `sms_spam_indo.csv`; semua cleaning dilakukan di memori.
- Jangan menulis angka metrik statis atau palsu. Jalankan `python -m backend.app.ml.train` dan gunakan isi `backend/artifacts/*.json`.
- Hindari data leakage. Preprocessing dan `TfidfVectorizer` yang belajar dari data harus tetap berada di dalam scikit-learn `Pipeline`.
- Jangan melakukan `fit_transform` ke seluruh dataset sebelum `train_test_split`.
- Gunakan `train_test_split(..., stratify=y, random_state=42)`.
- Label model hanya `ham` dan `spam`. Jangan menjadikan `Promosi` atau `Penipuan` sebagai label prediksi model tanpa dataset tiga kelas.
- Jika ingin mengaktifkan stemming, validasi ulang metrik dan simpan hanya jika performanya tidak memburuk.
- Jangan log isi pesan pengguna secara permanen.
- CORS production harus memakai origin eksplisit lewat `CORS_ORIGINS`, bukan wildcard.
