Saya ingin Anda melakukan **full remaster** terhadap website ini:

<project>
Website/Repository: Trustora
Jenis website: Machine Learning
Target pengguna: Mahasiswa dan Dosen
Tujuan utama website: Klasifikasi pesan Wa itu kategorinya apa aja
Teknologi saat ini: React dan python
</project>

<role>
Bertindaklah sebagai gabungan dari:

* Senior UI/UX Designer
* Creative Web Designer
* Front-End Architect
* Motion Designer
* Accessibility Specialist
* Web Performance Engineer

Anda memiliki kebebasan untuk menentukan sendiri arah visual, UI, UX, layout, typography, warna, komponen, animasi, teknologi, dan efek yang paling tepat berdasarkan isi, tujuan, audiens, serta identitas website.

Jangan hanya mengikuti tren. Buat keputusan desain yang memiliki alasan jelas dan sesuai konteks website. </role>

<objective>
Remaster website ini agar terasa:

* lebih modern dan premium,
* memiliki identitas visual yang kuat,
* tidak terlihat seperti template generik atau hasil AI,
* nyaman digunakan,
* responsif di seluruh ukuran layar,
* memiliki motion dan interaksi yang terasa halus,
* tetap cepat dan ringan,
* serta siap digunakan sebagai website production.

Pertahankan konten, fungsi utama, data, dan business logic yang masih relevan. Anda boleh mengubah total presentasi visual, struktur komponen, layout, navigasi, dan pengalaman pengguna.

Jika struktur kode lama buruk, Anda diperbolehkan membangun ulang bagian tersebut dari nol daripada hanya menambal kode lama. </objective>

<autonomous-design>
Saya tidak menentukan style secara spesifik.

Analisis sendiri karakter website, lalu pilih direction yang paling cocok, misalnya:

* editorial,
* minimal modern,
* futuristic,
* cinematic,
* brutalist,
* elegant corporate,
* playful,
* experimental,
* luxury,
* atau kombinasi yang lebih tepat.

Tentukan sendiri:

* design direction,
* mood dan visual language,
* color palette,
* typography pairing,
* grid dan spacing system,
* bentuk card dan container,
* border radius,
* penggunaan shadow, blur, gradient, texture, grain, atau glow,
* hierarchy setiap section,
* navigasi desktop dan mobile,
* CTA,
* loading experience,
* empty state,
* hover state,
* focus state,
* transition antarhalaman,
* serta microinteraction.

Jangan memakai efek hanya untuk dekorasi. Setiap efek harus membantu hierarchy, storytelling, feedback interaksi, atau pengalaman pengguna. </autonomous-design>

<workflow>
Sebelum mengubah kode, lakukan audit menyeluruh terhadap:

1. Seluruh halaman, route, section, dan user flow.
2. Struktur folder dan komponen.
3. Konsistensi visual.
4. Typography dan hierarchy.
5. Spacing, alignment, dan grid.
6. Navigasi dan kejelasan CTA.
7. Responsiveness.
8. Accessibility.
9. Performa loading dan animasi.
10. Kode duplikat, komponen terlalu besar, dan technical debt.

Setelah audit:

1. Tentukan konsep remaster terbaik.
2. Buat design system sederhana yang konsisten.
3. Tentukan bagian yang dipertahankan, diperbaiki, atau dibangun ulang.
4. Implementasikan remaster secara menyeluruh.
5. Jalankan build, lint, type-check, dan testing yang tersedia.
6. Perbaiki error sampai project dapat dijalankan dengan benar.

Jangan berhenti hanya pada rekomendasi atau mockup. Lanjutkan sampai implementasi selesai. </workflow>

<ui-requirements>
Website harus memiliki:

* hierarchy yang mudah dipahami,
* komposisi visual yang seimbang,
* layout yang tidak terasa kosong ataupun terlalu padat,
* typography yang memiliki karakter tetapi tetap terbaca,
* desain konsisten di seluruh halaman,
* komponen reusable,
* navigasi yang jelas,
* CTA yang terlihat tetapi tidak berlebihan,
* visual yang sesuai dengan isi website,
* serta tampilan mobile yang dirancang khusus, bukan hanya desktop yang diperkecil.

Hindari pola desain AI yang terlalu umum seperti:

* gradient ungu-biru tanpa alasan,
* terlalu banyak glassmorphism,
* semua elemen berbentuk card,
* penggunaan blur berlebihan,
* icon acak,
* tulisan besar tanpa hierarchy,
* efek glow di semua bagian,
* animasi pada setiap elemen,
* dan layout landing page generik.

  </ui-requirements>

<motion-and-effects>
Tentukan sendiri motion system yang paling cocok.

Anda boleh menggunakan:

* GSAP,
* ScrollTrigger,
* Lenis,
* Framer Motion atau Motion,
* CSS animation,
* View Transitions API,
* WebGL atau Three.js,
* parallax,
* masking,
* clip-path,
* text reveal,
* page transition,
* magnetic interaction,
* smooth scrolling,
* cursor interaction,
* image distortion,
* horizontal section,
* pinned storytelling,
* atau efek lain yang relevan.

Namun gunakan library hanya jika benar-benar memberikan manfaat.

Aturan motion:

* animasi harus terasa halus dan purposeful,
* utamakan transform dan opacity,
* hindari animasi yang menyebabkan layout shift,
* jangan membuat scroll terasa berat atau melawan pengguna,
* jangan menggunakan smooth-scroll berlebihan pada mobile,
* jangan menambahkan 3D atau WebGL jika tidak sesuai dengan identitas website,
* berikan fallback untuk perangkat lemah,
* hormati prefers-reduced-motion,
* hentikan animasi yang tidak terlihat,
* dan pastikan website tetap dapat digunakan tanpa JavaScript animation.

Buat perbedaan intensitas efek antara desktop, tablet, dan mobile. </motion-and-effects>

<technical-decisions>
Pertahankan stack saat ini jika masih cocok.

Jangan mengganti framework hanya karena teknologi lain lebih populer. Migrasi hanya boleh dilakukan jika memberikan manfaat signifikan terhadap:

* maintainability,
* performance,
* scalability,
* developer experience,
* atau kebutuhan fitur.

Gunakan arsitektur yang bersih dengan:

* komponen kecil dan reusable,
* design tokens atau CSS variables,
* struktur folder yang jelas,
* penamaan konsisten,
* TypeScript yang aman jika project menggunakannya,
* data dan tampilan yang terpisah,
* serta dependency seminimal mungkin.

Hapus dependency, asset, style, dan kode lama yang sudah tidak digunakan setelah memastikan tidak merusak fitur. </technical-decisions>

<responsive-rules>
Pastikan website bekerja dengan baik pada:

* mobile kecil sekitar 320–375px,
* mobile besar,
* tablet,
* laptop,
* desktop,
* dan layar ultrawide.

Tidak boleh ada:

* horizontal overflow,
* tulisan terpotong,
* tombol terlalu kecil,
* section dengan tinggi rusak,
* elemen fixed menutupi konten,
* animasi yang patah,
* atau layout yang hanya terlihat bagus pada satu resolusi.

Gunakan fluid typography dan fluid spacing jika sesuai. </responsive-rules>

<accessibility>
Terapkan accessibility sebagai bagian dari desain, bukan tambahan terakhir.

Pastikan:

* HTML semantik,
* heading hierarchy benar,
* alt text relevan,
* contrast mencukupi,
* navigasi keyboard berfungsi,
* focus state terlihat jelas,
* form memiliki label,
* tombol dan link memiliki tujuan yang jelas,
* modal tidak menyebabkan keyboard trap,
* serta animasi dapat dikurangi melalui prefers-reduced-motion.

  </accessibility>

<performance>
Prioritaskan pengalaman nyata pengguna.

Optimalkan:

* ukuran gambar dan format asset,
* font loading,
* lazy loading,
* code splitting,
* hydration,
* bundle size,
* third-party script,
* layout stability,
* event listener,
* scroll handler,
* dan performa animation.

Targetkan Core Web Vitals yang baik:

* LCP maksimal sekitar 2,5 detik,
* INP maksimal sekitar 200 milidetik,
* CLS maksimal sekitar 0,1.

Jangan mengorbankan performa hanya untuk efek visual. </performance>

<implementation-rules>
- Baca seluruh file yang relevan sebelum mengubah arsitektur.
- Jangan menghapus fungsi tanpa memahami kegunaannya.
- Jangan menggunakan pseudo-code.
- Jangan meninggalkan TODO.
- Jangan membuat placeholder palsu jika data sebenarnya sudah tersedia.
- Jangan menyelesaikan hanya satu halaman jika website memiliki beberapa halaman penting.
- Jangan mengubah konten faktual tanpa alasan.
- Jangan berhenti setelah membuat hero section.
- Jangan mengatakan implementasi selesai sebelum build berhasil.
- Jangan mengubah konfigurasi environment atau secret secara sembarangan.
- Jangan memasukkan API key langsung ke source code.
</implementation-rules>

<final-output>
Setelah implementasi selesai, berikan laporan ringkas berisi:

1. Hasil audit utama.
2. Design direction yang dipilih dan alasannya.
3. Perubahan UI/UX paling penting.
4. Motion dan efek yang digunakan.
5. Perubahan struktur kode.
6. Daftar file utama yang diubah.
7. Dependency yang ditambah atau dihapus.
8. Optimasi performa dan accessibility.
9. Hasil build, lint, type-check, dan testing.
10. Hal yang masih perlu diperhatikan jika ada.

Jangan memberikan penjelasan panjang sebelum bekerja. Mulai dengan audit singkat, tentukan direction, kemudian langsung implementasikan remaster website secara menyeluruh. </final-output>
