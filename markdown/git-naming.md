# Naming, PR, dan Daily Report

Panduan singkat untuk membuat nama branch, commit, PR title, deskripsi PR, dan daily report yang rapi, natural, serta tetap mengikuti gaya project Trustora.

## Branch Naming

- Format branch mengikuti workflow repo: `type/deskripsi-singkat-dengan-dash`.
- Untuk task Andino atau task personal, gunakan prefix nama sendiri: `andino/type/deskripsi-singkat`.
- Type yang umum dipakai: `fix`, `feat`, `feature`, `hotfix`, `refactor`, `chore`, `docs`, dan `test`.
- Gunakan huruf kecil dan dash, bukan spasi atau underscore.
- Branch yang sudah dipakai PR tidak perlu di-rename kecuali reviewer meminta eksplisit.

Contoh branch:

```text
andino/fix/batch-csv-validation
andino/feat/metrics-dashboard
andino/fix/predict-empty-message
andino/feature/training-artifacts-refresh
```

## Commit Message

- Format tetap mengikuti Conventional Commits: `type(domain): ringkasan perubahan`.
- Ringkasan boleh natural seperti gaya tim, tetapi tetap jelas mencakup perubahan utama.
- Gunakan `fix` untuk bug/perbaikan flow, `feat` untuk fitur baru, `refactor` untuk perubahan struktur tanpa ubah behavior, `chore` untuk config/dependency, `docs` untuk dokumentasi, dan `test` untuk testing.
- Kalau commit mencakup banyak file dalam satu konteks, pakai ringkasan yang mencakup semua perubahan penting.

Contoh commit:

```text
fix(api): handle model belum tersedia
fix(batch): validate kolom pesan di CSV
feat(metrics): tampilkan confusion matrix artifact
feat(ml): refresh training artifacts dari dataset aktif
```

Hindari commit terlalu umum:

```text
fix bug
update
wip
tes
```

## Pull Request Title

- Format title PR mengikuti pola tim: `[TARGET] source-branch : ringkasan perubahan`.
- Target biasanya `[STAGING]` untuk PR ke staging dan `[MAIN]` untuk PR ke main.
- Ringkasan PR boleh natural dan humanize, tetapi tetap menjelaskan inti perubahan.
- Sebelum create PR, cek contoh PR terbaru di GitHub agar format tetap konsisten dengan tim.
- Jika reviewer meminta penyesuaian nama PR, cukup update title PR.

Contoh PR title:

```text
[STAGING] andino/fix/batch-csv-validation : Fix validasi upload CSV Trustora
[STAGING] andino/fix/predict-empty-message : Fix handling pesan kosong
[STAGING] andino/feat/metrics-dashboard : tampilkan metrics dashboard
[MAIN] andino/feat/training-artifacts-refresh : refresh artifacts training model
```

Untuk PR remerge atau reset branch karena history `staging` berubah, branch di-rebuild, atau commit orang lain ikut terbawa, pakai kata `remerge` di ringkasan:

```text
[STAGING] andino/fix/batch-csv-validation : remerge validasi batch CSV
```

## Pull Request Description

- Deskripsi PR dibuat singkat, natural, dan langsung menjelaskan perubahan utama.
- Jangan terlalu kaku seperti laporan teknis panjang jika PR tim lain memakai gaya sederhana.
- Tulis test yang benar-benar sudah dijalankan.
- Jika tidak ada migration, tulis `Tidak ada migration`, bukan checklist rollback yang tidak relevan.

Template:

```markdown
## Apa yang berubah?

Fix validasi upload CSV, pesan error batch, dan tampilan hasil prediksi Trustora.

Form batch sekarang memberi feedback lebih jelas saat file kosong, bukan CSV, atau tidak memiliki kolom `Pesan`.

## Kenapa perlu berubah?

Sebelumnya upload batch bisa gagal tanpa pesan yang cukup jelas untuk user.

Validasi backend sudah ada, tetapi copy dan state error frontend perlu diselaraskan agar mudah dipahami.

Perubahan ini tidak mengubah dataset asli atau label model.

## Cara test

1. Buka section CSV di frontend Trustora.
2. Upload CSV valid dan CSV tanpa kolom `Pesan`.
3. Pastikan preview, validasi, tabel hasil, dan download CSV sesuai ekspektasi.

## Checklist

- [x] Sudah di-test sesuai area perubahan
- [x] Tidak ada console error atau log yang tidak perlu
- [x] Tidak ada hardcoded credential atau API key
- [x] Tidak ada migration, atau migration sudah dicek bila ada
```

## Laporan Setelah Pull Request

Setelah PR dibuat, kirim laporan singkat ke grup, mentor, reviewer, atau task tracker dengan title PR dan link PR.

Contoh:

```text
[STAGING] Fix validasi upload CSV Trustora
https://github.com/[org]/[repo]/pull/[nomor]
```

## Daily Report

Daily report mengikuti aturan tempat kerja. Bahasanya harus singkat, humanize, dan langsung menjelaskan pekerjaan yang dilakukan.

Contoh daily report:

```text
1. Cek validasi pesan kosong di endpoint prediksi
2. Menyesuaikan feedback error upload CSV
3. Memastikan metrics dashboard membaca artifacts aktual
4. Menjalankan pytest backend untuk area prediksi
5. Menjalankan typecheck frontend setelah perubahan UI
```
