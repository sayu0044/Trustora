# Trustora - Product Requirements Document

## Overview
Build aplikasi lokal Trustora untuk membantu user menganalisis SMS atau chat berbahasa Indonesia dan mendapatkan prediksi awal apakah pesan termasuk Normal atau Spam, lengkap dengan confidence, indikasi kata kunci, level risiko, dan saran keamanan.

## Core Features

### User Management
- Tidak ada login atau role management pada implementasi saat ini.
- Akses aplikasi bersifat lokal melalui frontend Vite dan backend FastAPI.
- Pembatasan akses production harus mengandalkan konfigurasi deployment dan CORS eksplisit bila aplikasi dipublikasikan.

### Main Feature
- Menganalisis satu pesan melalui endpoint `/api/predict` dan menampilkan kategori Normal/Spam, confidence, level risiko, indikasi, kata kunci mencurigakan, advice, dan disclaimer.
- Menampilkan dashboard evaluasi dari artifacts training seperti best model, perbandingan model, ringkasan dataset, dan confusion matrix.
- Mendukung prediksi batch CSV melalui endpoint `/api/predict-batch` dengan kolom wajib `Pesan`.
- Menjaga label model tetap binary `ham` dan `spam`; promosi atau penipuan hanya indikator tambahan berbasis keyword.

### Organization
- Dashboard ringkas untuk melihat performa model dan ringkasan dataset.
- Form analisis pesan tunggal dengan state loading, error, kosong, dan hasil prediksi.
- Upload CSV untuk analisis batch, preview file, tabel hasil, dan unduhan CSV hasil prediksi.
- Tampilan berbasis section React untuk analisis, evaluasi, dan CSV.

## Technical Requirements

### Frontend
- Gunakan stack frontend project: React, TypeScript, Vite, CSS biasa, lucide-react, dan fetch API client di `frontend/src/services/api.ts`.
- UI harus konsisten, responsif, aksesibel, dan mengikuti pola komponen yang sudah ada di `frontend/src/components`.
- State management memakai React state lokal untuk message, file, loading, error, result, metrics, dan preview.
- Validasi client-side hanya sebagai pendukung; validasi backend tetap menjadi sumber kebenaran.

### Backend
- Gunakan stack backend project: FastAPI, Pydantic, Pandas, NumPy, scikit-learn, joblib, Matplotlib, python-multipart, dan Sastrawi opsional.
- Endpoint API dan response mengikuti pola `backend/app/api/routes.py` dan `backend/app/schemas.py`.
- Training harus menjaga preprocessing dan TF-IDF di dalam scikit-learn `Pipeline` untuk mencegah data leakage.
- Validasi input, ukuran pesan, ukuran CSV, format CSV, dan error handling wajib konsisten.
- Konfigurasi dataset, CORS, artifacts, dan deployment memakai environment variable atau config server-side.
- Jangan menjadikan `Promosi` atau `Penipuan` sebagai label model tanpa dataset tiga kelas.

### Infrastructure
- Environment-based configuration melalui `.env`, `backend/app/config.py`, dan `VITE_API_BASE_URL`.
- Containerization hanya digunakan bila project atau workflow deploy membutuhkannya.
- Automated testing mencakup `pytest backend/tests`, `python -m compileall backend`, `npm run test`, `npm run typecheck`, dan `npm run build`.
- CI/CD pipeline ready bila project akan dikerjakan tim atau masuk production.
- Jangan log isi pesan pengguna secara permanen.

## Success Criteria
- User dapat menganalisis pesan tunggal dan batch CSV dengan feedback yang jelas.
- Fitur prioritas berjalan sesuai acceptance criteria, termasuk validasi pesan kosong, CSV wajib memiliki kolom `Pesan`, dan model belum tersedia menghasilkan pesan yang bisa ditindaklanjuti.
- Metrik yang ditampilkan berasal dari artifacts training aktual, bukan angka statis.
- Tampilan responsif pada perangkat target user.
- Tidak ada defect critical sebelum release

## Priority
1. **Phase 1**: Analisis pesan tunggal, training model, API prediksi, UI dasar React, dan dashboard metrik.
2. **Phase 2**: Batch CSV, perbaikan evaluasi model, validasi tambahan, dan enhancement UX prioritas.
3. **Phase 3**: Observability, packaging/deployment, optimasi performa, dataset lanjutan, dan polishing.

## Timeline
Target MVP: [DURASI_TARGET] dengan asumsi scope, resource, dependency project, environment, dan integrasi sudah jelas.
