# Trustora - Deteksi Pesan Spam Indonesia

Trustora adalah aplikasi web lokal untuk menganalisis SMS atau chat berbahasa Indonesia dan memprediksi apakah pesan termasuk **Normal** atau **Spam**. Model machine learning hanya dilatih pada dua label dataset, yaitu `ham` dan `spam`; indikasi **Promosi** atau **Penipuan** adalah penjelasan tambahan berbasis kata kunci, bukan kelas training.

## Arsitektur

- Backend: FastAPI, Pydantic, Pandas, NumPy, Scikit-learn, Joblib, Matplotlib, Sastrawi opsional.
- Machine learning: pipeline `preprocess_text -> TfidfVectorizer -> classifier`, sehingga teks mentah dapat langsung diprediksi tanpa preprocessing frontend.
- Frontend: React, Vite, TypeScript, CSS biasa.
- Dataset default project ini berada di `csv/sms_spam_indo.csv` dan dibaca lewat `DATASET_PATH`.
- CLI lokal: `trustora install`, `trustora train`, `trustora serve`, dan `trustora test`.

## Struktur Folder

```text
backend/
  app/
    api/routes.py
    ml/train.py
    ml/model_registry.py
    services/preprocessing.py
    services/keyword_analyzer.py
    services/risk_analyzer.py
    services/predictor.py
    main.py
  artifacts/
  tests/
frontend/
  src/components/
  src/services/
  src/types/
csv/
  sms_spam_indo.csv
trustora.ps1
trustora.bat
```

## Dataset Aktual

- Baris awal: 1.143
- Kolom: `Kategori`, `Pesan`
- Label awal: `spam=574`, `ham=569`
- Missing value: 0
- Duplikat kombinasi pesan-label: 1
- Baris setelah cleaning: 1.142
- Label setelah cleaning: `spam=574`, `ham=568`
- Rata-rata panjang pesan: 108,74 karakter
- Median panjang pesan: 113 karakter

File CSV asli tidak diubah. Cleaning dilakukan di memori saat training.

## Preprocessing

Preprocessing melakukan case folding, normalisasi Unicode, normalisasi spasi, penggantian URL/email/telepon/nominal uang/angka menjadi token, pembersihan simbol, tokenisasi, dan stopword removal hati-hati. Kata negasi `tidak`, `bukan`, `jangan`, `belum`, dan `tanpa` dipertahankan. Stemming Sastrawi tersedia secara opsional tetapi tidak diaktifkan default.

## Model dan Evaluasi Aktual

Model yang dibandingkan:

| Model | Accuracy | Precision Spam | Recall Spam | F1 Spam | Macro F1 CV |
| --- | ---: | ---: | ---: | ---: | ---: |
| Multinomial Naive Bayes | 95,63% | 94,87% | 96,52% | 95,69% | 96,27% |
| Logistic Regression | 97,38% | 96,58% | 98,26% | 97,41% | 96,93% |
| Linear SVM | 97,38% | 96,58% | 98,26% | 97,41% | 97,04% |

Model tersimpan: `backend/artifacts/model.joblib`

Model terbaik yang disimpan adalah **Logistic Regression** dengan `C=1.0`. Logistic Regression dan Linear SVM memiliki skor test sama pada prioritas utama; pemilihan dilakukan oleh urutan evaluasi deterministik setelah tie pada F1 spam, recall spam, macro F1, dan accuracy. Prioritas metrik menempatkan F1 dan recall spam lebih tinggi daripada accuracy karena false negative spam lebih berisiko.

Confusion matrix model terbaik:

```text
TN ham: 110
FP spam: 4
FN spam: 2
TP spam: 113
```

## Menjalankan dengan Trustora CLI

Cara paling praktis di Windows adalah memakai CLI lokal:

```powershell
.\trustora.bat install
.\trustora.bat train
.\trustora.bat serve
```

Jika folder project sudah masuk `PATH`, command juga bisa dipanggil sebagai:

```powershell
trustora install
trustora train
trustora serve
```

Command yang tersedia:

| Command | Fungsi |
| --- | --- |
| `trustora install` | Membuat atau memakai ulang `.venv`, install dependency Python, menjalankan `npm install`, dan memastikan `.env` memakai `DATASET_PATH=csv/sms_spam_indo.csv`. |
| `trustora train` | Menjalankan training model dan menulis artifacts ke `backend/artifacts/`. |
| `trustora serve` | Menjalankan backend FastAPI dan frontend Vite sekaligus dalam satu terminal. |
| `trustora test` | Menjalankan backend pytest, frontend Vitest, dan TypeScript typecheck. |
| `trustora help` | Menampilkan bantuan CLI. |

`trustora install` tidak otomatis menjalankan training. Jalankan `trustora train` setelah install atau setiap dataset/model perlu diperbarui. Backend berjalan di `http://localhost:8000`, dokumentasi API tersedia di `http://localhost:8000/docs`, dan frontend berjalan di `http://localhost:5173`.

## Menjalankan Manual

### Backend

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
$env:DATASET_PATH="csv/sms_spam_indo.csv"
python -m backend.app.ml.train
uvicorn backend.app.main:app --reload
```

Linux/macOS:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
export DATASET_PATH=csv/sms_spam_indo.csv
python -m backend.app.ml.train
uvicorn backend.app.main:app --reload
```

Backend berjalan di `http://localhost:8000` dan dokumentasi API tersedia di `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default memakai:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Menjalankan Test dan Build

Dengan CLI:

```powershell
.\trustora.bat test
```

Manual:

```bash
pytest backend/tests
python -m compileall backend
cd frontend
npm run test
npm run typecheck
npm run build
```

Hasil verifikasi terakhir:

- `python -m backend.app.ml.train`: berhasil.
- `pytest backend/tests`: 10 passed, 1 warning dari dependency FastAPI/TestClient.
- `python -m compileall backend`: berhasil.
- Backend import check: berhasil.
- `npm install`: berhasil, 0 vulnerability.
- `npm run test`: 1 test file passed, 3 tests passed.
- `npm run typecheck`: berhasil.
- `npm run build`: berhasil.

## Contoh API

Health:

```bash
curl http://localhost:8000/api/health
```

Prediksi:

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Selamat Anda mendapatkan hadiah, klik link berikut\"}"
```

Batch CSV:

```bash
curl -X POST http://localhost:8000/api/predict-batch \
  -F "file=@pesan.csv"
```

## Keterbatasan

- Model hanya binary: `ham` dan `spam`.
- Promosi dan penipuan adalah indikator kata kunci, bukan kelas hasil training.
- Dataset relatif kecil, sehingga prediksi tetap perlu diperlakukan sebagai bantuan awal.
- Confidence berasal dari probabilitas model; untuk SVM digunakan kalibrasi probabilitas saat training.

## Rencana Pengembangan

Jika dataset baru tersedia dengan label `normal`, `promosi`, dan `penipuan`, struktur layanan dapat diperluas menjadi klasifikasi tiga kelas dengan mengganti validasi label, training target, dan mapping tampilan. Modul keyword/risk analyzer tetap bisa dipakai sebagai lapisan penjelasan tambahan.
