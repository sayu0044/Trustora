# Git Branch Tips Trustora

Panduan ini berisi tips praktis saat mengerjakan task di Trustora, terutama supaya branch dan Pull Request tetap bersih walaupun harus meniru flow dari branch lain atau resolve conflict ke `staging`.

Panduan utama tetap:

- [git-workflow.md](markdown/git-workflow.md)
- [git-naming.md](markdown/git-naming.md)

File ini hanya tambahan pengalaman lapangan, termasuk pola yang dipakai saat resolve conflict atau rebuild branch PR.

## 1. Mulai Branch dari `main`

Default workflow project ini: branch kerja dibuat dari `main`, lalu PR ke `staging`.

```bash
git fetch origin --prune
git checkout -b andino/feat/nama-fitur origin/main
```

Pakai `origin/main` sebagai titik mulai agar branch benar-benar dibuat dari remote terbaru, bukan dari local `main` yang bisa saja belum fetch, belum fast-forward, atau sudah tercampur merge lokal. Local `main` tetap boleh dipakai jika sudah dipastikan bersih dan sama dengan `origin/main`:

```bash
git checkout main
git pull --ff-only origin main
git status --short --branch
git checkout -b andino/feat/nama-fitur
```

Gunakan nama branch sesuai `git-naming.md`:

```text
andino/feat/metrics-dashboard
andino/fix/batch-csv-validation
andino/fix/predict-empty-message
```

Kenapa dari `main`:

- Branch lebih bersih.
- PR hanya berisi perubahan task sendiri.
- Tidak ikut membawa commit branch orang lain.
- Lebih mudah direview oleh atasan atau reviewer.

## 2. Kalau Mau Meniru Branch Lain, Jangan Langsung Merge

Kadang fitur sudah ada di branch lain, atau website demo/main/staging terlihat berbeda dari lokal. Jangan langsung merge branch orang ke branch kita hanya untuk meniru behavior.

Lihat dulu bedanya:

```bash
git fetch origin
git diff main..origin/nama-branch-lain -- path/yang/relevan
git show <commit_sha> -- path/yang/relevan
```

Kalau ingin lihat file versi branch lain tanpa mengubah branch:

```bash
git show origin/nama-branch-lain:path/ke/file.php
```

Kalau ingin membandingkan file lokal dengan branch lain:

```bash
git diff HEAD..origin/nama-branch-lain -- path/ke/file.php
```

Catatan penting:

- `git cherry-pick` secara resmi berarti menerapkan perubahan commit ke branch saat ini.
- Untuk sekadar melihat perbedaan, lebih aman pakai `git diff` atau `git show`.
- Cherry-pick boleh dipakai jika memang ingin mem-port commit tertentu secara terkontrol.
- Setelah tahu behavior yang dibutuhkan, implementasikan perubahan di branch sendiri sesuai scope task.

## 3. Commit Kecil dan Satu Concern

Jangan tunggu semua perubahan besar selesai baru commit satu kali.

Contoh commit yang rapi:

```bash
git add backend/app/api/routes.py backend/app/services/predictor.py
git commit -m "feat(api): add prediction response field"

git add backend/app/ml/train.py backend/app/ml/model_registry.py
git commit -m "feat(ml): refresh training artifact flow"

git add backend/tests/test_api.py backend/tests/test_ml.py
git commit -m "test(api): add prediction and training tests"
```

Keuntungannya:

- Mudah dicek ulang.
- Mudah di-cherry-pick.
- Mudah resolve conflict.
- PR terlihat niat dan tidak seperti `wip`.

## 4. Saat PR Conflict ke `staging`

Untuk conflict kecil, ikuti `git-workflow.md`: sync target branch, resolve conflict, test, lalu push.

Tapi kalau `staging` sedang banyak remerge/reset dan merge langsung ke branch PR bisa membuat diff PR membengkak, gunakan pola branch temporary.

Contoh kasus PR:

- Branch PR awal: `andino/feat/metrics-dashboard`
- Target PR: `staging`
- PR conflict di beberapa file.
- Kalau merge `origin/staging` langsung ke branch PR, raw diff berisiko ikut membawa banyak perubahan staging.
- Solusi: buat branch temporary dari `origin/staging`, lalu cherry-pick commit fitur sendiri.

## 5. Pola Branch Temporary dari `origin/staging`

Pastikan working tree bersih dulu:

```bash
git status --short --branch
git fetch origin --prune
```

Buat branch temporary dari staging terbaru:

```bash
git checkout -b andino/feat/metrics-dashboard-staging-resolve-2 origin/staging
```

Cherry-pick commit fitur sendiri satu per satu:

```bash
git cherry-pick <commit_fitur_1>
git cherry-pick <commit_fitur_2>
git cherry-pick <commit_test>
git cherry-pick <commit_logging>
```

Kalau conflict muncul:

```bash
git status --short
```

Resolve file konflik dengan prinsip:

- Pertahankan perubahan `staging` sebagai baseline.
- Tambahkan perubahan fitur sendiri di titik yang memang diperlukan.
- Jangan menghapus endpoint/service/artifact flow milik fitur staging lain.
- Jangan memilih semua perubahan kita atau semua perubahan staging tanpa memahami behavior.

Setelah conflict dibereskan:

```bash
git add path/yang/conflict.php
git cherry-pick --continue
```

Ulangi sampai semua commit fitur berhasil masuk.

## 6. Saat PR Ke `staging` Membawa Banyak Commit Orang Lain

Gejalanya:

- PR ke `staging` menampilkan banyak commit dan file changed.
- Padahal branch fitur sendiri hanya punya sedikit commit.
- GitHub menampilkan `Can't automatically merge`.
- Banyak commit dari `main` atau branch orang lain ikut terbaca di tab commit PR.

Contoh nyata:

- Branch: `andino/feat/training-artifacts-refresh`.
- Sebelum dibersihkan: PR ke `staging` menampilkan 34 commit dan 40 file changed.
- Setelah rebuild dari `origin/staging` dan cherry-pick 3 commit fitur sendiri: PR menjadi 3 commit dan 3 file changed.

Penyebab yang sering terjadi:

- Branch fitur dibuat dari `main`, tetapi `staging` sedang tidak sejajar dengan `main`.
- GitHub membandingkan `base: staging` dengan `compare: branch-fitur`, sehingga commit `main` yang belum ada di `staging` ikut terbaca.
- Masalah ini bukan berarti 3 commit fitur salah; biasanya base history branch dan target PR yang tidak sejajar.

Diagnosis dulu sebelum mengubah history:

```bash
git fetch origin --prune
git status --short --branch

git rev-list --count origin/main..HEAD
git rev-list --count origin/staging..HEAD

git diff --stat origin/main...HEAD
git diff --stat origin/staging...HEAD

git log --oneline origin/staging..HEAD
```

Cara membaca hasilnya:

- Jika `origin/main..HEAD` kecil dan `origin/main...HEAD` hanya file fitur sendiri, branch bersih terhadap `main`.
- Jika `origin/staging..HEAD` besar dan `origin/staging...HEAD` banyak file non-task, PR ke `staging` akan ikut membawa commit/file orang lain.
- Jika target PR tetap harus `staging`, solusi paling bersih adalah rebuild branch dari `origin/staging`, bukan merge `staging` langsung ke branch lama.

Clean rebuild yang aman:

```bash
git status --short --branch
git fetch origin --prune
git checkout -b andino/feat/nama-fitur-staging-clean origin/staging

git cherry-pick <commit_fitur_1>
git cherry-pick <commit_fitur_2>
git cherry-pick <commit_fitur_3>
```

Kalau conflict muncul:

- Resolve hanya di file area fitur.
- Pertahankan `origin/staging` sebagai baseline.
- Tambahkan perubahan fitur sendiri di titik yang diperlukan.
- Jangan membawa perubahan `main` atau branch orang lain yang tidak terkait task.
- Jika ada folder tool/cache untracked seperti `.serena/`, jangan commit. Hapus atau abaikan sebelum lanjut.

Verifikasi sebelum update branch PR:

```bash
git diff --stat origin/staging...HEAD
git diff --name-only origin/staging...HEAD
git diff --check
git log --oneline origin/staging..HEAD
```

Jika ada file PHP yang berubah, jalankan syntax check:

```bash
php -l path/file-yang-diubah.php
```

Ekspektasi:

- `git log --oneline origin/staging..HEAD` hanya berisi commit fitur sendiri.
- `git diff --name-only origin/staging...HEAD` hanya berisi file scope task.
- Tidak ada whitespace error.
- Syntax check targeted aman.

Setelah yakin branch temporary sudah benar, update branch PR yang sama:

```bash
git push --force-with-lease origin HEAD:andino/feat/nama-fitur
```

Lalu sinkronkan branch lokal utama ke remote PR yang sudah bersih:

```bash
git checkout andino/feat/nama-fitur
git fetch origin --prune
git pull --ff-only origin andino/feat/nama-fitur
```

Jika local branch lama sudah berbeda history karena remote branch dibersihkan dengan `--force-with-lease`, gunakan hanya setelah working tree bersih dan remote PR sudah benar:

```bash
git reset --hard origin/andino/feat/nama-fitur
```

### Template Reset Branch PR

Pakai pola ini kalau branch PR pernah masuk atau ter-merge ke `staging`, lalu `staging` sempat reset atau history-nya berubah sehingga PR baru ikut membawa commit orang lain.

Sumber kebenaran wajib memakai branch remote `origin/...`, bukan branch lokal:

```bash
git fetch origin --prune
git log --oneline origin/staging..origin/andino/feat/nama-fitur
git diff --stat origin/staging...origin/andino/feat/nama-fitur
git diff --name-only origin/staging...origin/andino/feat/nama-fitur
```

Pisahkan dulu commit yang valid:

- Commit sendiri yang benar-benar sesuai task branch.
- Commit orang lain yang ikut terbawa dari `staging`, `main`, atau branch lain.
- Merge commit atau history staging yang tidak relevan.
- Commit sendiri yang author-nya benar, tetapi isinya mencampur perubahan non-task.

Kalau PR harus tetap ke `staging`, rebuild dari `origin/staging` lalu cherry-pick hanya commit task sendiri:

```bash
git checkout -b andino/feat/nama-fitur-staging-clean origin/staging
git cherry-pick <commit_task_1>
git cherry-pick <commit_task_2>
git cherry-pick <commit_test>
```

Kalau conflict muncul, pertahankan `origin/staging` sebagai baseline dan masukkan hanya perubahan task sendiri. Jangan membawa endpoint, service, artifact, component, atau file lain milik task orang lain hanya karena ikut muncul di branch asal.

Sebelum update branch PR, wajib cek:

```bash
git log --oneline origin/staging..HEAD
git diff --stat origin/staging...HEAD
git diff --name-only origin/staging...HEAD
git diff --check
```

Update remote PR hanya setelah yakin bersih dan sudah ada izin eksplisit:

```bash
git push --force-with-lease origin HEAD:andino/feat/nama-fitur
```

Laporan akhir minimal berisi branch asal, branch hasil perbaikan, base yang dipakai, commit yang dipertahankan, commit/file asing yang tidak dibawa, area fitur yang tetap ada, dan status apakah sudah bersih untuk PR.

## 7. Verifikasi Diff Tetap Fokus

Sebelum update branch PR, cek diff terhadap `origin/staging`:

```bash
git diff --stat origin/staging...HEAD
git diff --check
```

Ekspektasi:

- File changed hanya area fitur sendiri.
- Tidak ada ratusan file staging lain.
- Tidak ada whitespace error.

Lanjut syntax check dan targeted test sesuai area perubahan:

```bash
python -m compileall backend
pytest backend/tests
```

Kalau diff membengkak, stop dulu. Biasanya ada commit asing ikut masuk atau base branch salah.

## 8. Update Branch PR dengan Aman

Kalau branch temporary sudah benar, update branch PR yang sama.

Gunakan `--force-with-lease`, bukan `--force`:

```bash
git push --force-with-lease origin HEAD:andino/feat/metrics-dashboard
```

Kenapa `--force-with-lease`:

- Lebih aman daripada `--force`.
- Git akan menolak push jika remote branch sudah berubah tanpa sepengetahuan lokal.
- Cocok untuk branch milik sendiri yang perlu dirapikan setelah rebuild dari `origin/staging`.

Setelah push:

- Refresh PR.
- Pastikan conflict hilang.
- Pastikan `Files changed` tetap fokus.
- Pastikan commit yang tampil hanya commit fitur sendiri.

## 9. Balikkan Local Branch ke Remote PR

Setelah branch PR berhasil di-update dari temporary branch, local branch utama bisa disesuaikan lagi:

```bash
git checkout andino/feat/metrics-dashboard
git pull --ff-only origin andino/feat/metrics-dashboard
```

Jika local branch berbeda history karena remote sudah di-force-with-lease dari branch temporary, gunakan cara yang jelas dan hati-hati:

```bash
git branch -f andino/feat/metrics-dashboard origin/andino/feat/metrics-dashboard
git checkout andino/feat/metrics-dashboard
```

Lalu cek:

```bash
git status --short --branch
git log --oneline origin/staging..HEAD
```

## 10. Hapus Branch Temporary Jika Sudah Tidak Dipakai

Setelah PR aman dan branch utama sudah sesuai remote:

```bash
git branch -d andino/feat/metrics-dashboard-staging-resolve-2
```

Kalau Git menolak karena branch dianggap belum merged, cek dulu sebelum hapus paksa:

```bash
git log --oneline andino/feat/metrics-dashboard-staging-resolve-2 --not andino/feat/metrics-dashboard
```

Jangan langsung pakai `-D` kalau belum yakin commit-nya sudah ada di branch PR.

## 11. Warning Penting

Jangan lakukan ini:

```bash
git push --force
```

Pakai ini jika memang perlu rewrite branch PR milik sendiri:

```bash
git push --force-with-lease origin HEAD:nama-branch
```

Jangan commit file lokal yang tidak relevan:

- `.env`
- credential
- API key
- log
- cache
- perubahan debug sementara

Jangan branch dari branch orang jika tidak ingin commit orang itu ikut PR.

Jangan branch dari local branch tanpa `git fetch origin --prune` dan cek status. Untuk branch baru yang harus bersih, lebih aman mulai dari `origin/main` atau `origin/staging` sesuai target workflow.

Jangan merge `origin/staging` langsung ke branch PR kalau tujuanmu hanya membuat diff PR tetap fokus dan staging sedang dalam kondisi banyak remerge/reset.

## 12. Checklist Sebelum Minta Merge

Sebelum laporan PR:

```bash
git status --short --branch
git diff --stat origin/staging...HEAD
git diff --check
git log --oneline origin/staging..HEAD
```

Pastikan:

- Working tree bersih atau hanya ada perubahan yang memang belum mau di-commit.
- Diff PR fokus pada scope task.
- Test area perubahan sudah jalan.
- PR title sesuai format `[STAGING] source-branch : ringkasan perubahan`.
- Deskripsi PR menjelaskan perubahan, alasan, cara test, dan migration jika ada.

## Referensi

- Git cherry-pick: https://git-scm.com/docs/git-cherry-pick
- Git push dan `--force-with-lease`: https://git-scm.com/docs/git-push
- GitHub resolve conflict command line: https://docs.github.com/articles/resolving-a-merge-conflict-using-the-command-line
