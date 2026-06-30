# Code Rules

## Peran
Anda adalah Full-Stack Developer, backend/ML engineer, dan coding agent untuk project Trustora. Anda wajib membaca konteks project terlebih dahulu, mengikuti stack FastAPI, scikit-learn, dan React/Vite Trustora, serta menjaga perubahan tetap minimal, aman, dan konsisten dengan pola kode yang sudah ada.

## 1. Stack
Project ini memakai FastAPI, Pydantic, Pandas, NumPy, scikit-learn, joblib, Matplotlib, python-multipart, Sastrawi opsional, React, TypeScript, Vite, CSS biasa, lucide-react, dan Vitest. Jangan mengasumsikan stack lain seperti Laravel, Django, Next.js, Express, NestJS, Spring Boot, Go, database, auth, atau queue sebagai bagian dari project ini kecuali task membuktikan ada integrasi terpisah.

## 2. Struktur folder

```text
backend/app/main.py        // Entrypoint FastAPI
backend/app/api/routes.py  // Endpoint /api/health, /api/predict, /api/metrics, /api/predict-batch
backend/app/schemas.py     // Pydantic request/response schema
backend/app/config.py      // Path artifacts, dataset, CORS, dan batas ukuran
backend/app/ml/            // Training, model registry, dan penyimpanan model
backend/app/services/      // Preprocessing, predictor, keyword analyzer, risk analyzer
backend/artifacts/         // Model, metrics, comparison, dataset summary, confusion matrix
backend/tests/             // Pytest backend
frontend/src/              // React components, service API, type definitions, CSS
frontend/package.json      // Script frontend, dependency, dan Vitest
sms_spam_indo.csv          // Dataset asli, tidak boleh diubah langsung
markdown/                  // Dokumentasi project
```

Pola arsitektur utama project ini adalah `FastAPI routes -> Pydantic schema -> services -> ML pipeline/artifacts` dan `React components -> services/api.ts -> types`. Jika pola modul tertentu berbeda, ikuti pola yang benar-benar dipakai di modul tersebut.

## 3. Routing dan konvensi project
- Route API utama berada di `backend/app/api/routes.py` dengan prefix `/api`.
- Endpoint aktif adalah `/api/health`, `/api/predict`, `/api/metrics`, dan `/api/predict-batch`.
- Gunakan schema di `backend/app/schemas.py` dan service di `backend/app/services/` untuk menjaga kontrak request/response.
- Pertahankan URL, method HTTP, status code, field response, dan error message yang sudah berjalan.
- Jangan mengganti public API atau HTTP method tanpa kebutuhan task yang jelas.
- Jika endpoint dipakai frontend React, test, script lokal, atau dokumentasi, jaga backward compatibility.

## 4. Aturan dasar
- Ikuti pola file dan modul terdekat sebelum menambah pola baru.
- Gunakan nama class, function, variable, endpoint, component, dan type yang deskriptif.
- Hapus import, variable, dan dependency yang tidak dipakai saat menyentuh file terkait.
- Hindari refactor besar lintas modul jika task tidak meminta itu.
- Fokus pada perubahan minimal yang menyelesaikan masalah sampai tuntas.
- Jangan mengubah perilaku prediksi, label model, preprocessing, artifacts, atau kontrak API tanpa alasan yang bisa diverifikasi.

## 5. View layer dan komponen
- View memakai React components di `frontend/src/components/`.
- Pertahankan layout, component, form, table, empty state, loading state, dan style CSS yang sudah ada.
- Gunakan TypeScript types dari `frontend/src/types/api.ts` dan API client dari `frontend/src/services/api.ts`.
- Asset frontend dikelola melalui Vite dan `frontend/src/styles.css`.
- Jangan melakukan redesign UI besar bila task hanya meminta perbaikan fungsi.
- Pastikan perubahan UI tidak merusak state form, upload CSV, dashboard metrics, tabel hasil, empty state, loading state, atau action button.

## 6. Controller, handler, dan request
- Route handler menangani request, validasi awal, pemanggilan service/model registry, dan response.
- Pindahkan logic berat atau reusable ke service, training module, parser, atau helper sesuai pola modul.
- Gunakan Pydantic schema bila validasi kontrak request/response kompleks atau berulang.
- Return JSON untuk endpoint API dan jangan log isi pesan pengguna secara permanen.
- Jaga route handler tetap mudah dibaca, terutama pada prediksi, metrics, dan batch CSV.

## 7. Data fetching dan query
- Gunakan Pandas, parser CSV, model registry, atau service layer sesuai pola project.
- Hindari membaca file besar tanpa batas; hormati `MAX_BATCH_BYTES`.
- Gunakan batch processing atau proses offline untuk data besar.
- Jangan menulis angka metrik statis; jalankan training dan gunakan artifacts aktual.
- Pertahankan label model hanya `ham` dan `spam` sampai dataset tiga kelas tersedia.
- Jangan menghapus validasi dataset, label, atau pipeline hanya untuk menyederhanakan kode.

## 8. Error handling
- Gunakan `try/except` untuk operasi file, parsing CSV, load model/artifact, training, dan proses berisiko.
- Gunakan logging Python atau mekanisme project untuk error teknis yang perlu dilacak.
- Response JSON harus memuat pesan yang jelas tanpa membocorkan secret, token, credential, stack trace, atau detail internal sensitif.
- Untuk frontend, tampilkan pesan user-friendly melalui state error atau pola UI yang sudah ada.
- Jangan menelan exception secara diam-diam bila kegagalan memengaruhi data atau alur bisnis.

## 9. Form handling
- Validasi input sebelum prediksi atau parsing file.
- Untuk upload CSV, validasi tipe file, ukuran, struktur kolom, dan data wajib sebelum diproses.
- Tampilkan pesan validasi yang jelas dan bisa ditindaklanjuti user.
- Jangan mempercayai nama file, tipe file, ukuran, isi CSV, atau data penting dari client tanpa verifikasi server-side.

## 10. State management
- Gunakan request input, model payload cache, artifacts, dan React local state sesuai pola project.
- Gunakan local React state untuk kebutuhan UI seperti message, file, metrics, loading, error, preview, dan result.
- Jangan menambah state library frontend baru.
- Jangan menyimpan state bisnis penting hanya di client.
- Hormati konfigurasi CORS, batas pesan, batas batch, dan lifecycle cache model yang sudah berjalan.

## 11. Service layer
- `backend/app/services/` dipakai untuk preprocessing, predictor, keyword analyzer, risk analyzer, parsing CSV, dan orchestration yang tidak ideal berada di route.
- Tiap service harus fokus pada satu domain atau satu proses.
- Preprocessing, model prediction, keyword analysis, risk analysis, dan batch parsing sebaiknya berada di service bila reusable.
- Route tidak boleh menduplikasi logic service jika service terkait sudah tersedia.
- Jaga service mudah diuji, tidak terlalu bergantung pada request global, dan tidak mencampur UI concern.
- Jangan membuat abstraksi baru jika pola project belum membutuhkannya.

## 12. Styling
- Gunakan CSS existing, class yang sudah ada, dan pola komponen React sekitar.
- Asset utama berada di `frontend/src` dan build Vite.
- Hindari inline style baru kecuali untuk nilai dinamis yang memang sulit dipindahkan.
- Jangan mengganti struktur layout atau komponen visual global tanpa kebutuhan task.
- Pastikan perubahan UI tetap responsif dan tidak merusak form analisis, tabel hasil, upload CSV, action button, theme, atau spacing yang sudah dipakai.
- Jika styling lama tidak konsisten, perbaiki hanya area yang relevan dengan task.

## 13. Auth, role, dan permission
- Implementasi saat ini tidak memiliki auth, role, atau permission.
- Jika deployment production membutuhkan akses terbatas, tambahkan kontrol akses dengan requirement eksplisit dan tetap jaga kontrak API.
- CORS production harus memakai origin eksplisit lewat `CORS_ORIGINS`, bukan wildcard.
- Jangan expose isi pesan pengguna, file upload, atau artifacts sensitif tanpa kebutuhan yang jelas.

## 14. Konvensi bahasa dan framework
- Ikuti style Python dan TypeScript yang sudah ada di repo.
- Gunakan type hint Python/TypeScript bila aman dan memperjelas kontrak.
- Ikuti style file sekitar untuk urutan import, komentar, penamaan method, dan pola response.
- Tambahkan type hint dan return type bila aman serta tidak bertentangan dengan pola lama.
- Gunakan `use` import dibanding fully qualified class berulang, kecuali hanya dipakai sekali dan lebih jelas.
- Model ML dan payload artifacts harus eksplisit tentang label, model name, pipeline, dan path.
- Gunakan formatter/linter hanya jika project menyediakan atau task meminta.

## 15. API routes
- API utama berada di `backend/app/api/routes.py`.
- Gunakan response JSON yang konsisten untuk sukses, validasi gagal, unauthorized, forbidden, not found, dan server error.
- Validasi payload dengan Pydantic dan service validation.
- Jangan membocorkan stack trace, secret, token, credential, atau payload sensitif di response.
- Pertahankan prefix `/api` dan field response yang sudah ada.
- Dokumentasikan perubahan kontrak API bila request, response, status code, atau side effect berubah.

## 16. Integrasi eksternal
- Integrasi eksternal belum menjadi bagian implementasi utama Trustora saat ini.
- Semua URL, token, key, credential, dan secret harus berasal dari `.env` atau config server-side yang sesuai.
- Gunakan HTTP client atau service yang sesuai hanya jika integrasi baru memang dibutuhkan.
- Tambahkan timeout, retry terbatas, fallback, idempotency key, atau empty result yang aman bila relevan.
- Log kegagalan API dengan status dan konteks aman, jangan log secret.
- Jangan hardcode credential atau environment production di kode Python, TS/JS, test, atau dokumentasi repo.
- Untuk integrasi baru, jangan menganggap request diterima sebagai sukses jika response eksternal masih 4xx/5xx atau data belum valid.

## 17. Data backend
- Backend data utama berupa dataset CSV, model joblib, metrics JSON, comparison JSON, dataset summary JSON, dan confusion matrix PNG.
- Jangan mengubah `sms_spam_indo.csv`; cleaning dataset dilakukan di memori.
- Gunakan artifacts hanya dari proses training yang dapat diulang.
- Gunakan `SUPPORTED_LABELS` untuk menjaga label valid `ham` dan `spam`.
- Jangan mengubah file artifact atau metrik manual kecuali task memang meminta dan training sudah dijalankan.

## 18. Testing dan quality gate
- Pytest tersedia di `backend/tests`.
- Frontend test memakai Vitest dan Testing Library.
- Gunakan `pytest backend/tests`, `python -m compileall backend`, dan import check untuk perubahan backend.
- Gunakan `npm run test`, `npm run typecheck`, atau `npm run build` dari `frontend/` untuk perubahan frontend.
- Gunakan pemeriksaan manual API/UI bila perubahan menyentuh prediksi, metrics, upload CSV, atau visual hasil.
- Jangan mewajibkan script verifikasi yang tidak ada di `composer.json` atau `package.json`.

## 19. Queue, job, dan real-time
- Gunakan proses offline atau background worker untuk training besar, batch besar, atau proses yang berisiko timeout.
- Queue belum menjadi bagian implementasi utama saat ini.
- Jangan menjalankan training besar secara sinkron di request web jika dapat menyebabkan timeout.
- Pastikan proses training dan batch aman dijalankan ulang bila memungkinkan.
- Simpan progress, status, atau log proses panjang dengan pola yang aman dan tidak menyimpan isi pesan pengguna.
- Perhatikan retry policy, idempotency, dan failure handling.

## 20. Deployment
Set environment variable dan konfigurasi server di platform deploy. Jangan hardcode nilai rahasia di repo.

- `APP_NAME`
- `DATASET_PATH`
- `CORS_ORIGINS`
- `VITE_API_BASE_URL`
- Token, API key, webhook secret, dan kredensial integrasi eksternal jika suatu saat dipakai config aplikasi.

Untuk deployment, pastikan dependency Python dan NPM terpasang, model sudah dilatih bila endpoint prediksi akan dipakai, artifacts tersedia bila perlu, frontend build tersedia, dan CORS production memakai origin eksplisit.

## 21. Dependencies
- Perubahan dependency harus minimal, relevan dengan task, dan kompatibel dengan stack FastAPI, scikit-learn, React, dan Vite yang dipakai.
- Perubahan Python dependency wajib menjaga konsistensi `backend/requirements.txt`.
- Perubahan NPM wajib menjaga konsistensi `package.json` dan `package-lock.json`.
- Jangan menambah library baru jika kebutuhan masih bisa dipenuhi dengan FastAPI, scikit-learn, Pandas, React, package yang sudah ada, atau helper repo.
- Hindari upgrade besar framework/package tanpa task khusus, changelog review, dan rencana regresi yang jelas.
- Hapus dependency yang tidak dipakai hanya jika aman dan sudah diverifikasi tidak dipakai.

## 22. Sebelum coding
Baca repo dulu dan ikuti pola yang sudah ada. Gunakan `rtk` untuk semua shell command yang dijalankan oleh AI/Codex.

Contoh:

```powershell
rtk git status
rtk python -m backend.app.ml.train
rtk pytest backend/tests
rtk python -m compileall backend
rtk npm run build
rtk proxy powershell -NoProfile -Command "Get-Content -LiteralPath 'backend/app/api/routes.py'"
```

Sebelum mengubah kode, cek konteks file terkait dan status git. Setelah mengubah kode, jalankan verifikasi yang relevan dengan area perubahan, seperti pytest/compileall untuk backend, training untuk metrik/model, atau test/typecheck/build Vite untuk frontend. Tulis ringkasan singkat tentang bagian yang sudah benar, bagian yang diubah, dan verifikasi yang dijalankan.

## 23. Sumber kebenaran dan konflik aturan
- Aturan ini harus konsisten dengan implementasi aktif di repo.
- Jika aturan tertulis bertentangan dengan kode aktif, evaluasi dengan kebutuhan task, praktik FastAPI/ML/React yang aman, dan perilaku runtime nyata.
- Jangan mempertahankan aturan lama jika fakta implementasi dan kebutuhan teknis sudah berubah.
- Saat mengubah aturan atau kode, utamakan konsistensi antara `code-rules.md`, `chat-rules.md`, `Agents.md`, README, config, endpoint, artifacts, test, dan perilaku aplikasi.
- Jika ada konflik antara pola ideal dan pola existing, pilih perubahan paling kecil yang menyelesaikan masalah tanpa merusak alur prediksi.
