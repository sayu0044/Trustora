# Panduan AGENTS untuk `Trustora`

Dokumen ini adalah aturan kerja untuk AI agent, coding assistant, dan developer yang mengubah project Trustora. Scope aktif project adalah root repo `Trustora`; folder dokumentasi di `markdown/` hanya dipakai sebagai referensi jika task meminta.

## 1. Root Project dan Batas Kerja

* Selalu jalankan command dari root repo `Trustora` kecuali task secara eksplisit meminta masuk ke `frontend/`.
* Jangan memperlakukan folder `markdown/` sebagai root aplikasi.
* Abaikan folder dependency, build, cache, dan artifact seperti `.venv`, `node_modules`, `frontend/dist`, `.pytest_cache`, `coverage`, log besar, dan asset besar yang tidak relevan.
* Sebelum mengubah kode, pahami file terdekat dengan task, endpoint terkait, request/response, pipeline ML, dan pola module yang sudah ada.
* Perubahan harus minimal, spesifik pada task, dan tidak merombak arsitektur tanpa instruksi eksplisit.

## 2. Stack Project

Project ini memakai FastAPI, scikit-learn, dan React/Vite sebagai aplikasi utama.

* Backend: FastAPI, Pydantic, Pandas, NumPy, scikit-learn, joblib, Matplotlib, python-multipart, dan Sastrawi opsional.
* Machine learning: `Pipeline` berisi preprocessing/TfidfVectorizer/model, training di `backend/app/ml/train.py`, artifacts di `backend/artifacts/`.
* Frontend: React, TypeScript, Vite, CSS biasa, lucide-react, dan fetch API client.
* Fitur utama: prediksi pesan, metrik model, confusion matrix artifact, keyword/risk analyzer, dan prediksi batch CSV.
* Jangan menambah framework atau library baru jika kebutuhan masih bisa diselesaikan dengan stack di atas atau helper project yang sudah ada.

## 3. Struktur Folder Inti

Gunakan struktur nyata project sebagai sumber kebenaran.

| Area | Lokasi utama |
| --- | --- |
| Entrypoint API | `backend/app/main.py` |
| Route API | `backend/app/api/routes.py` |
| Schema request/response | `backend/app/schemas.py` |
| ML training dan registry | `backend/app/ml/train.py`, `backend/app/ml/model_registry.py` |
| Service backend | `backend/app/services/preprocessing.py`, `predictor.py`, `keyword_analyzer.py`, `risk_analyzer.py` |
| Artifact model/metrik | `backend/artifacts/` |
| Test backend | `backend/tests/` |
| Frontend React | `frontend/src/`, termasuk `components`, `services`, dan `types` |
| Config | `backend/app/config.py`, `.env`, `.env.example`, `frontend/package.json` |

Jika nama folder domain sudah ada, tambahkan file baru sedekat mungkin dengan domain tersebut. Jangan membuat struktur baru sebelum memeriksa pola sekitar.

## 4. Aturan Coding Trustora

* Jaga endpoint `/api/health`, `/api/predict`, `/api/metrics`, dan `/api/predict-batch` beserta kontrak request/response yang sudah berjalan.
* Untuk input user, gunakan Pydantic schema, validasi service, dan batas ukuran file/pesan yang sudah ada.
* Jangan mengubah `sms_spam_indo.csv`; cleaning dataset dilakukan di memori saat training.
* Pertahankan preprocessing dan `TfidfVectorizer` yang belajar dari data di dalam scikit-learn `Pipeline`.
* Jangan melakukan `fit_transform` ke seluruh dataset sebelum `train_test_split`.
* Untuk React, pertahankan komponen, state loading/error/result, service API, dan tipe response yang sudah ada.
* Jangan melakukan redesign UI besar jika task hanya meminta perbaikan fungsi atau dokumentasi.
* Jangan hardcode secret, credential, URL production, token, API key, atau konfigurasi environment di kode, view, test, maupun dokumentasi.
* Jika menyentuh dependency, update manifest dan lockfile yang sesuai, lalu pastikan perubahan memang diperlukan.

## 5. Command yang Disarankan

Semua shell command wajib diawali `rtk`. Untuk PowerShell cmdlet atau built-in, gunakan `rtk proxy powershell -NoProfile -Command "..."`.

| Command | Kegunaan |
| --- | --- |
| `rtk python -m backend.app.ml.train` | Training model dan menulis artifacts aktual. |
| `rtk uvicorn backend.app.main:app --reload` | Menjalankan FastAPI dev server. |
| `rtk pytest backend/tests` | Menjalankan test backend. |
| `rtk python -m compileall backend` | Cek syntax/import Python. |
| `rtk python -c "from backend.app.main import app; print(app.title)"` | Cek import aplikasi FastAPI. |
| `rtk npm run dev` | Menjalankan Vite dev server dari folder `frontend/`. |
| `rtk npm run test` | Menjalankan Vitest frontend dari folder `frontend/`. |
| `rtk npm run typecheck` | Cek TypeScript frontend dari folder `frontend/`. |
| `rtk npm run build` | Build frontend production dari folder `frontend/`. |

Jangan menjalankan command berat seperti full build, full test suite, migration nyata, queue worker panjang, atau deployment kecuali task membutuhkannya.

## 6. Verifikasi Perubahan

Pilih verifikasi paling relevan dengan area yang diubah.

* Dokumentasi: baca ulang file yang diubah dan pastikan tidak ada instruksi generik yang menyesatkan.
* Python backend: jalankan `rtk pytest backend/tests`, `rtk python -m compileall backend`, atau test spesifik sesuai area.
* Training/ML: jalankan `rtk python -m backend.app.ml.train` sebelum mengklaim metrik baru.
* Frontend React: cek state form, upload CSV, error/loading/result, lalu jalankan `rtk npm run test`, `rtk npm run typecheck`, atau `rtk npm run build` dari `frontend/` bila relevan.
* Endpoint API: cek kontrak response dan status code, terutama error 400/422/503.

Jika verifikasi tidak bisa dijalankan karena environment, dependency, database, atau konfigurasi lokal, catat alasannya secara singkat di final response.

## 7. Prinsip Aman

* Jangan mengubah dataset asli, artifacts, atau metrik tanpa menjalankan proses yang membuktikan hasilnya.
* Jangan menghapus validasi input, batas ukuran batch, disclaimer, atau guard CORS hanya untuk menyederhanakan kode.
* Jangan mengubah `.env` kecuali diminta; gunakan `.env.example` untuk dokumentasi konfigurasi bila perlu.
* Jangan commit, push, deploy, menjalankan migration nyata, atau mengubah service eksternal tanpa instruksi eksplisit.
* Jika ada perubahan user yang belum Anda buat di worktree, jangan revert. Baca dan bekerja berdampingan dengan perubahan tersebut.

Ikuti dokumen ini bersama `chat-rules.md`, `code-rules.md`, dan `token.md`. Jika aturan bertentangan, gunakan instruksi sistem/platform tertinggi terlebih dahulu, lalu instruksi pengguna terbaru, lalu implementasi aktif Trustora.
