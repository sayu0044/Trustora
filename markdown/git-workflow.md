# Git Workflow Guide

Berlaku untuk project Trustora. Workflow yang digunakan adalah GitHub Flow, dengan `main` sebagai branch production atau source of truth utama.

## Aturan Paling Penting

`main` adalah branch production yang harus selalu stabil. Jangan push langsung ke `main`. Semua perubahan wajib melalui Pull Request, dengan alur kerja branch dari `main`, PR ke `staging`, lalu setelah testing clear baru PR ke `main`.

## 1. Overview

Tim menggunakan GitHub Flow berbasis branch sederhana. Semua pekerjaan dilakukan di branch kerja, lalu dibuka Pull Request ke `staging` untuk review dan testing sebelum perubahan dipromosikan ke `main`.

| Branch | Fungsi | Deploy ke |
| --- | --- | --- |
| `main` | Source of truth, selalu stable | Production |
| `feature/*` | Pengembangan fitur baru | Staging via PR |
| `fix/*` | Bug fix non-critical | Staging via PR |
| `hotfix/*` | Fix critical di production | Production, expedited |

## 2. Naming Convention

Format:

```text
type/deskripsi-singkat-dengan-dash
```

| Type | Digunakan untuk | Contoh |
| --- | --- | --- |
| `feature` | Fitur baru | `feature/training-artifacts-refresh` |
| `fix` | Bug fix tidak urgent | `fix/batch-csv-validation` |
| `hotfix` | Fix critical di production | `hotfix/item-export-null-crash` |
| `refactor` | Refactor tanpa ubah behavior | `refactor/sellout-mapper-service` |
| `chore` | Config, dependency update, dan sejenisnya | `chore/update-laravel-dependencies` |

Gunakan huruf kecil dan dash, bukan underscore atau spasi. Nama branch harus cukup deskriptif agar bisa dipahami tanpa konteks tambahan. Jika task atau gaya tim memakai prefix nama, gunakan format seperti `andino/fix/batch-csv-validation`.

## 3. Alur Kerja Lengkap

### Step 1 - Buat branch dari branch utama yang up-to-date

Selalu mulai dari `main` terbaru. Jangan branch dari branch orang lain kecuali ada alasan teknis yang jelas.

```bash
git checkout main
git pull origin main
git checkout -b fix/batch-csv-validation
```

### Step 2 - Kerjakan fitur dan commit secara rutin

Commit kecil dan sering lebih baik daripada satu commit besar di akhir. Tiap commit sebaiknya punya satu konteks perubahan yang jelas dan bisa dipahami dari pesannya.

```bash
git add -p
git commit -m "fix(batch): validate kolom pesan di CSV"
```

Gunakan `git add -p` bila memungkinkan agar perubahan yang masuk commit lebih intentional daripada `git add .`.

### Step 3 - Push dan buka PR ke branch target

Push branch ke remote, lalu buka PR ke `staging` untuk review dan testing.

```bash
git push origin fix/batch-csv-validation
```

Buka PR di GitHub atau platform Git lain:

- Base: `staging`
- Compare: `fix/batch-csv-validation`

### Step 4 - Testing di environment target dan perbaikan

Setelah PR diuji atau branch masuk environment staging, jalankan test sesuai area perubahan. Kalau ada bug, commit fix ke branch yang sama selama PR masih relevan.

```bash
git commit -m "fix(batch): handle file CSV kosong"
git push origin fix/batch-csv-validation
```

Jika workflow membutuhkan update setelah testing staging, tetap lanjutkan di branch yang sama sampai reviewer menyetujui.

### Step 5 - Setelah testing clear, buka PR ke `main`

Buka PR baru jika perubahan di `staging` sudah clear:

- Base: `main`
- Compare: `fix/batch-csv-validation`

Tunggu approval dari reviewer sebelum merge.

CI harus hijau sebelum merge. Kalau CI merah, fix dulu sebelum meminta reviewer melakukan override. Catatan: aturan CI/CD mengikuti kondisi project dan branch protection yang aktif.

### Step 6 - Setelah merge, hapus branch

Branch yang sudah di-merge ke `main` tidak perlu dipertahankan, kecuali repo punya aturan release branch tertentu.

```bash
# Hapus remote branch, bisa juga via tombol di platform Git
git push origin --delete fix/batch-csv-validation

# Hapus local branch
git branch -d fix/batch-csv-validation
```

## 4. Commit Message

Gunakan format Conventional Commits:

```text
type(domain): deskripsi singkat
```

| Type | Kapan dipakai | Contoh |
| --- | --- | --- |
| `feat` | Fitur baru | `feat(profit): add released at & marketplace filter` |
| `fix` | Perbaikan bug | `fix(batch): validate kolom pesan di CSV` |
| `refactor` | Refactor tanpa ubah behavior | `refactor(sellout): extract sellout logic ke service class` |
| `chore` | Dependency, config, dan sejenisnya | `chore: update guzzle ke versi 7.8` |
| `docs` | Perubahan dokumentasi | `docs: update git workflow Trustora` |
| `test` | Tambah atau perbaiki test | `test: unit test untuk bundle price calculator` |
| `style` | Formatting tanpa ubah logika | `style: reformat sesuai PSR-12` |

Gunakan imperative mood: `tambah validasi`, bukan `menambahkan validasi`. Bayangkan kalimatnya melanjutkan `commit ini akan ...`.

Contoh commit yang baik:

```text
feat: tambah dashboard metrik model
fix: pesan kosong tidak dikirim ke endpoint prediksi
refactor: pisahkan parsing CSV batch ke service
```

Contoh commit yang buruk:

```text
fix bug
update
wip
asdfgh
tes1
tes2
```

## 5. Pull Request

Template deskripsi PR bersifat opsional, tetapi sangat disarankan.

```markdown
## Apa yang berubah?

Fix validasi upload CSV, pesan error batch, dan tampilan hasil prediksi Trustora.

## Kenapa perlu berubah?

Sebelumnya upload batch bisa gagal tanpa pesan yang cukup jelas untuk user.

## Cara test

1. Buka section CSV di frontend Trustora.
2. Upload CSV valid dan CSV tanpa kolom `Pesan`.
3. Pastikan preview, validasi, tabel hasil, dan download CSV sesuai ekspektasi.

## Checklist

- [ ] Sudah di-test di staging
- [ ] Tidak ada console error atau log yang tidak perlu
- [ ] Ada migration? Sudah dicek dan aman untuk dijalankan?
- [ ] Tidak ada hardcoded credential atau API key
```

Aturan review:

- Minimal 1 approval dari reviewer, senior developer, atau tech lead sebelum merge ke `main`.
- CI harus hijau. Jangan merge kalau build atau test merah.
- Resolve semua comment sebelum merge. Kalau tidak setuju, diskusikan.
- Satu PR = satu concern. Jangan campur fitur baru dengan refactor besar.

## 6. Aturan Wajib

Aturan berikut sebaiknya di-enforce melalui branch protection atau aturan repository.

- Push langsung ke `main` diblokir.
- Semua perubahan wajib melalui PR.
- PR ke `staging` dilakukan untuk review dan testing sebelum PR ke `main`.
- CI wajib hijau sebelum merge.
- Minimal 1 review approval untuk branch penting.
- Branch harus up-to-date sebelum merge jika repo mewajibkan.

## 7. Handling Conflict

Kalau dua branch mengubah file yang sama, conflict bisa terjadi saat merge. Semakin lama branch tidak di-sync ke `main`, semakin besar kemungkinan conflict.

### Cara sync branch ke branch utama terbaru

```bash
# Pastikan local main up-to-date
git checkout main
git pull origin main

# Kembali ke feature branch, merge dari main
git checkout fix/batch-csv-validation
git merge main

# Resolve conflict di editor, lalu
git add .
git commit -m "chore: merge main into fix/batch-csv-validation"
git push origin fix/batch-csv-validation
```

Gunakan merge, bukan rebase, untuk sync dari `main` ke feature branch. Rebase melakukan rewrite history dan berbahaya kalau branch sudah di-push atau dikerjakan bersama orang lain.

### Frekuensi sync yang disarankan

Lakukan `git merge main` ke feature branch setidaknya setiap 2 sampai 3 hari untuk task yang panjang, terutama kalau sudah banyak branch lain yang merge ke `main`. Jangan tunggu sampai mau buka PR baru baru ketahuan conflict-nya besar.

## 8. Yang Tidak Boleh Dilakukan

- Force push ke branch yang sudah di-share tanpa koordinasi. `git push --force` ke branch yang sudah di-push akan merusak history orang lain. Gunakan `--force-with-lease` kalau benar-benar perlu, dan hanya di branch milik sendiri.
- Commit credential, API key, file `.env`, private key, atau secret lain. Sekali ter-commit ke remote, credential dianggap compromised meskipun sudah dihapus.
- Merge tanpa test di staging terlebih dahulu. PR ke `main` hanya dibuka setelah fitur diverifikasi di staging.
- Branch dari branch orang lain tanpa alasan yang jelas. Kalau branch A belum merge ke `main` dan kamu branch dari A, PR kamu akan include semua commit dari branch A juga. Selalu branch dari `main`.
- Membiarkan branch idle terlalu lama tanpa sync. Branch yang tidak aktif lebih dari 2 minggu berpotensi menimbulkan conflict besar.
- Menggabungkan fitur besar, refactor besar, dan bug fix kecil dalam satu PR.

Kalau ada pertanyaan, diskusikan di channel tim atau langsung ke reviewer/tech lead.
