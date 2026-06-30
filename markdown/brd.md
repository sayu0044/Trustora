# Business Requirements Document: Trustora

Document ID: BRD-TRUSTORA-[YYYY-MM-DD]
Date: [YYYY-MM-DD]
Owner: [NAMA_OWNER_BISNIS]
Status: Draft for Business, Product, and Engineering review

## Executive Summary

Trustora adalah aplikasi lokal untuk membantu analisis awal pesan SMS atau chat berbahasa Indonesia dengan prediksi Normal/Spam, indikator keyword, level risiko, dan saran keamanan. Dokumen ini menjelaskan kebutuhan bisnis agar proses analisis pesan tetap jelas, transparan, dan berbasis model yang dapat diverifikasi.

Tujuan utama project ini adalah memastikan user dapat mengecek pesan mencurigakan melalui aplikasi Trustora dengan cepat, aman, dan mudah dipahami. Fokus BRD ini adalah outcome bisnis, batasan scope, requirement fungsional, requirement non-fungsional, serta kriteria sukses yang perlu divalidasi bersama business, product, engineering, dan QA.

## Business Objectives

1. Objective-001: Menyediakan alat analisis pesan berbahasa Indonesia untuk deteksi awal Normal/Spam.
2. Objective-002: Mengurangi risiko user mengikuti pesan mencurigakan melalui indikasi keyword, level risiko, dan advice yang jelas.
3. Objective-003: Menyediakan metrik model dan ringkasan dataset agar hasil prediksi dapat dievaluasi secara transparan.
4. Objective-004: Mendukung analisis banyak pesan melalui upload CSV tanpa mengubah dataset training asli.

## Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Executive Sponsor | [NAMA] | Funding, strategic alignment, final escalation |
| Business Owner | [NAMA_OWNER_BISNIS] | Business requirements, priority, sign-off |
| Product Owner | [NAMA_PRODUCT_OWNER] | Scope, feature priority, user value |
| Technical Owner | [NAMA_TECHNICAL_OWNER] | Architecture, build, and delivery for Trustora |
| QA / Tester | [NAMA_QA_TESTER] | Test planning and acceptance validation |
| End Users | [USER_TRUSTORA] | Daily use and feedback |

## Scope

### In Scope
- Analisis pesan tunggal melalui form frontend dan endpoint `/api/predict`.
- Dashboard evaluasi model dari artifacts training aktual.
- Upload CSV dengan kolom `Pesan` untuk analisis batch.
- Preprocessing, keyword analyzer, risk analyzer, dan advice sesuai implementasi backend.

### Out of Scope
- Redesign total aplikasi, perubahan brand besar, atau penggantian stack FastAPI/React tanpa inisiatif terpisah.
- Integrasi baru yang belum disetujui business owner, product owner, dan technical owner.
- Migrasi besar dataset, perubahan label menjadi tiga kelas, atau automasi lintas sistem yang belum masuk scope fase ini.
- Proses manual di luar Trustora yang tidak memiliki dampak langsung ke prediksi, evaluasi, atau UI aplikasi.

## Functional Requirements

- FR-001: Sistem harus memungkinkan user menganalisis pesan tunggal dan menerima prediksi Normal/Spam.
- FR-002: Sistem harus menampilkan confidence, level risiko, indikasi spam, keyword mencurigakan, advice, dan disclaimer.
- FR-003: Sistem harus menyediakan dashboard metrik model dan ringkasan dataset dari artifacts training.
- FR-004: Sistem harus mendukung upload CSV untuk prediksi batch dengan validasi format dan kolom `Pesan`.
- FR-005: Sistem harus menjaga label model hanya `ham` dan `spam` sampai dataset tiga kelas tersedia.
- FR-006: Sistem harus menampilkan pesan sukses, gagal, model belum tersedia, file tidak valid, dan validasi input yang jelas.
- FR-007: Sistem harus menyediakan confusion matrix artifact bila training sudah dijalankan.
- FR-008: Sistem harus mendukung download hasil batch CSV dari frontend.
- FR-009: Sistem harus menjaga konsistensi preprocessing saat training dan prediksi melalui pipeline yang sama.
- FR-010: Sistem harus menyediakan mekanisme konfigurasi dataset, CORS, dan API base URL tanpa hardcode nilai sensitif.

## Non-Functional Requirements

- NFR-001: Sistem harus tersedia minimal [TARGET_UPTIME] pada jam penggunaan yang ditentukan.
- NFR-002: Response utama harus selesai dalam [TARGET_RESPONSE_TIME] untuk skenario normal seperti prediksi pesan, load metrik, dan batch kecil.
- NFR-003: Sistem harus mampu menangani minimal [JUMLAH_USER] pengguna atau request sesuai kebutuhan Trustora.
- NFR-004: UI harus responsif pada perangkat yang digunakan target user internal, terutama untuk halaman tabel, form, modal, dashboard, dan report.
- NFR-005: Sistem harus mengikuti kebijakan keamanan, autentikasi, authorization, role/permission, validasi input, dan pengelolaan data yang berlaku.
- NFR-006: Sistem harus memiliki logging atau monitoring yang cukup tanpa menyimpan isi pesan pengguna secara permanen.

## Assumptions

- Dataset training utama berasal dari `sms_spam_indo.csv` dan tidak diubah langsung oleh aplikasi.
- Stakeholder bisnis, product, engineering, dan QA tersedia untuk review requirement, validasi flow, UAT, dan sign-off sebelum release.
- Jika dataset baru dipakai, kontrak kolom minimal tetap perlu memuat `Pesan` dan `Kategori` dengan label yang didukung.
- Batasan teknis mengikuti project Trustora, termasuk FastAPI, scikit-learn pipeline, React/Vite, artifacts, dan test yang sudah berjalan.

## Success Criteria

- Kriteria-001: User dapat menganalisis pesan tunggal dan batch CSV tanpa hambatan besar pada scope yang tersedia.
- Kriteria-002: Fitur utama berjalan sesuai acceptance criteria, termasuk validasi pesan kosong, file CSV, model belum tersedia, dan tampilan hasil.
- Kriteria-003: Metrik, model, dan dataset summary tetap konsisten dengan artifacts hasil training.
- Kriteria-004: Defect critical dan high sudah diselesaikan atau memiliki keputusan mitigasi sebelum release.

## Sign-off

| Name | Role | Signature | Date |
|------|------|-----------|------|
| | Executive Sponsor | | |
| | Business Owner | | |
| | Product Owner | | |
| | Technical Owner | | |
