# Panduan Instalasi — Portal Nabire Kreatif

## Pembaruan v5 (November 2026) — langkah singkat
1. **Backend:** ganti isi `Kode.gs` di Apps Script dengan versi baru → **Terapkan → Kelola deployment → pensil → Versi baru → Terapkan**. Kolom baru (galeri foto, link demo, grup WA) dibuat otomatis pada permintaan pertama — tidak perlu menjalankan apa pun.
2. **GitHub (aset situs):** ekstrak `Nabire-Kreatif-Frontend-v5.zip` ke folder repo `nabire-kreatif` (timpa berkas lama; `js/config.js` di ZIP sudah berisi URL backend Anda), lalu:
   ```bash
   git add . && git commit -m "Rilis v5: beranda baru, galeri produk, lebih cepat" && git push
   ```
3. **Blogger (www.nabirekreatif.com):** Blogger → Tema → ▾ → **Cadangkan** (simpan tema lama) → ▾ → **Pulihkan** → pilih `Tema-Blogger-Nabire-Kreatif.xml`. Tema ini memuat portal di beranda dengan tampilan awal instan (tanpa layar putih), memuat aset dari GitHub Pages, dan menampilkan halaman /p/ serta postingan Blogger dengan gaya rapi.
   - Bila URL backend (GAS_URL) berganti, ubah juga di tema: Edit HTML → cari `NK_CONFIG`.
4. **Produk:** Admin → Produk → Ubah: unggah **Foto tambahan** (maks 8, slider + perbesar), isi **Link demo** (tombol "Lihat Demo"), dan **Link grup WhatsApp** (hanya tampil untuk pembeli produk itu, mis. grup template / grup kelas).
5. **Template berlisensi:** unduh ulang `nk-license.js` dari Admin → Lisensi Template (sekarang v6: sebelum lisensi hanya pita **DEMO** di atas, tanpa bilah melayang; mendukung Blogger), lalu proteksi ulang template Anda (lihat PANDUAN-LISENSI-TEMPLATE.md).

### Kenapa lebih cepat
- JavaScript digabung & dikecilkan: beranda hanya memuat ±35 KB (gzip); modul admin, editor Link Bio, dan lisensi dimuat belakangan saat dibutuhkan.
- Tampilan awal beranda (header + hero) sudah ada di HTML, jadi cat pertama langsung menampilkan isi — tidak ada layar putih.
- Font dimuat tanpa memblokir tampilan; ilustrasi hero dibuat dari HTML/CSS (tanpa gambar besar); efek blur berat dihapus.
- Uji internal (CPU 4× lebih lambat, jaringan 4G lambat): cat pertama 2,3 dtk → 1,1 dtk; LCP 2,9 dtk → 1,1 dtk; total unduhan 374 KB → 174 KB. Nilai PageSpeed sebenarnya dapat berbeda — ukur ulang setelah rilis.

### Untuk pengembang
- Sumber ada di `js/*.js` dan `css/style.css`; `index.dev.html` memuat sumber tanpa bundel (untuk debugging).
- Setelah mengubah sumber: `npm i esbuild` lalu `node tools/build.js` (membuat `dist/`, `sdk/nk-license.js`, `index.html`, dan `blogger/Tema-Blogger-Nabire-Kreatif.xml`). `tools/shell.js` membuat ulang cuplikan tampilan awal (butuh Playwright).

---

Arsitektur: **Frontend** (HTML/CSS/JS murni) di **GitHub Pages** + **Backend** Google Apps Script (REST JSON) + **Google Sheets** sebagai database.

Anda punya 2 bagian yang dipasang terpisah:

| Bagian | Isi | Dipasang di |
|---|---|---|
| Frontend | `index.html`, `css/`, `js/`, `assets/` (isi ZIP) | GitHub Pages |
| Backend | `Kode.gs`, `Notifikasi.gs`, `Migrasi.gs`, `LinkBio.gs`, `Lisensi.gs`, `appsscript.json` (diunduh terpisah, TIDAK ada di ZIP) | Google Apps Script |

---

## A. Pasang Backend (Apps Script) — ±10 menit

1. Buka <https://script.google.com> → **Proyek baru**. Beri nama `Nabire Kreatif API`.
2. Buat 5 berkas skrip (ikon **+** → Skrip) bernama `Kode`, `Notifikasi`, `Migrasi`, `LinkBio`, `Lisensi`. Tempel isi `Kode.gs`, `Notifikasi.gs`, `Migrasi.gs`, `LinkBio.gs`, `Lisensi.gs` ke masing-masing (hapus isi bawaan).
3. Buka **Pengaturan Proyek (ikon roda gigi)** → centang **Tampilkan berkas manifes "appsscript.json" di editor**. Kembali ke Editor, buka `appsscript.json`, ganti seluruh isinya dengan berkas `appsscript.json` dari kami. Simpan.
4. Di editor, pilih fungsi **`setupAppEnvironment`** → **Jalankan**. Setujui izin (Spreadsheet, Drive, Gmail, koneksi eksternal). Jika muncul "Google belum memverifikasi aplikasi ini" → *Lanjutan* → *Buka (tidak aman)* — ini skrip milik Anda sendiri.
5. Buka **Log Eksekusi**. Catat **email admin** dan **kata sandi superadmin** (12 karakter acak). Kata sandi hanya tampil sekali — simpan di tempat aman, lalu ganti di menu *Profil* setelah login.
   - Setup membuat spreadsheet database, folder Drive (BuktiTransfer, Testimoni, Backup), 5 layanan jasa, **data contoh**, dan 3 pemicu otomatis (antrean notifikasi, kunjungan, backup harian).
   - Aman dijalankan ulang: setup kedua ditolak agar data tidak rusak.
6. **Terapkan** → **Deploy baru** → jenis **Aplikasi web**:
   - *Jalankan sebagai*: **Saya**
   - *Yang memiliki akses*: **Siapa saja**
   - Salin **URL Aplikasi Web** (berakhiran `/exec`).

> Setiap kali Anda mengubah kode `.gs`: **Terapkan → Kelola deployment → ikon pensil → Versi: Versi baru → Terapkan**. URL `/exec` tidak berubah. (Jangan membuat deployment baru, karena URL akan berganti.)

## B. Hubungkan Frontend

1. Ekstrak ZIP frontend. Buka `js/config.js`, isi:
   ```js
   GAS_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   ```
2. Simpan. (Selama `GAS_URL` kosong, situs tampil sebagai *Mode pratinjau* dengan data contoh bawaan.)

## C. Terbitkan ke GitHub Pages (lewat terminal)

1. Buat repositori **kosong** di GitHub, misalnya `nabire-kreatif` (Public).
2. Buka terminal **di dalam folder hasil ekstrak ZIP** — folder yang berisi `index.html` langsung. Perintah `git init` harus dijalankan di folder ini, bukan di folder induknya:
   ```bash
   cd nabire-kreatif-frontend      # folder hasil ekstrak, berisi index.html
   git init
   git add .
   git commit -m "Rilis pertama Nabire Kreatif"
   git branch -M main
   git remote add origin https://github.com/USERNAME/nabire-kreatif.git
   git push -u origin main
   ```
   Jangan unggah lewat tombol *Upload files* di web: folder `css/` dan `js/` bisa gagal terunggah dan situs tampil tanpa gaya.
3. Di GitHub: **Settings → Pages → Source: Deploy from a branch → Branch `main` / folder `/ (root)` → Save**.
4. Tunggu 1–2 menit. Alamat situs: `https://USERNAME.github.io/nabire-kreatif/`.
5. Update berikutnya: ubah berkas → `git add . && git commit -m "pesan" && git push`.

## D. Pengaturan Setelah Login

Masuk di `/#/masuk` dengan email admin dan kata sandi dari Log Eksekusi.

- **Beranda & Pengaturan** (`/admin/beranda`): nama, tagline, WhatsApp admin, rekening bank, gambar QRIS, statistik beranda, **Google Client ID** (opsional, untuk tombol "Masuk dengan Google").
- **Google Login (opsional)**: Google Cloud Console → *APIs & Services → Credentials → OAuth client ID (Web)* → *Authorized JavaScript origins*: `https://USERNAME.github.io` → salin Client ID ke Pengaturan Beranda.
- **Produk, Kelas, Galeri Demo, Layanan, Testimoni**: menu masing-masing. Produk digital: isi `link_unduh` (PDF otomatis bisa dibuka di web). Kelas: tambahkan pelajaran 1–5 dengan link YouTube.
- **Persetujuan** (`/admin/persetujuan`): setujui/tolak bukti transfer. Saat disetujui, akses terbuka dan email berisi kode akses terkirim otomatis.
- **Kode Akses** (`/admin/kode`): buat kode massal untuk dijual di Lynk.id. Satu kode = satu produk = sekali pakai, tanpa masa berlaku.

### Unggah foto (tanpa URL)
Semua gambar (sampul produk, galeri demo, foto testimoni, logo, QRIS, foto Link Bio) diunggah langsung dari HP/komputer lewat tombol **Unggah foto**. Foto dikompres otomatis dan disimpan di folder Drive **Gambar** (dibuat otomatis, dibuka untuk siapa pun yang punya link agar bisa tampil di web). Saat foto diganti/dihapus, file lama otomatis dibuang dari Drive. Jika Anda memperbarui dari versi sebelumnya, jalankan **Deploy → Versi baru** dan izinkan akses Drive bila diminta.

### Produk Link Bio (tampilan baru)
1. Menu **Link Bio** (admin) → **Tambah Produk Link Bio**. Atur harga dan saklar tampil di katalog.
2. Member yang membeli/redeem mendapat **Link Bio Saya** dengan susunan: banner sampul bergelombang, logo bulat, nama + kota, deskripsi, **tombol pil** (Facebook, Instagram, YouTube + hingga 5 tombol tautan sendiri seperti Spotify/Market Place), karosel **produk favorit** (maks 6, tombol “Lihat Semua”), kartu **lokasi** (alamat, “Lihat di Google Maps”, peta), dan penutup **Terima Kasih**. Tema siap pakai “Resto Emas”, dst., warna bebas diubah.
3. **Pesanan lewat WhatsApp**: produk tanpa link tujuan langsung membuka WhatsApp ke nomor pemesanan dengan pesan yang bisa dikustom (sisipan `{nama}` `{produk}` `{harga}` `{gambar}`). Link foto produk otomatis ikut terkirim. Tiap produk boleh punya pesan sendiri atau link tujuan lain.
4. Halaman publik: `https://domain-anda/#namamember`. Kontrol admin: saklar utama, blokir/hapus halaman, hide produk dari katalog.

### Lisensi Template Web (anti jual-ulang)
Pembeli membayar → muncul **kode lisensi + link unduh Drive** di Aset Saya → template dipasang di domainnya → tampil **DEMO** sampai kode dimasukkan **sekali** lewat `domain.com/#key` (landing page) atau menu **Lisensi** (dasbor). Setelah aktif, semua pengunjung tidak diminta kode. Template yang diubah atau hak ciptanya dihapus **terkunci**. Domain Anda sendiri (`nabirekreatif.com`, subdomain, localhost) bebas. Langkah lengkap + skill proteksi: **PANDUAN-LISENSI-TEMPLATE.md**.

### Notifikasi WhatsApp (opsional, Fonnte)
Menu **Notifikasi WA**: tab *Konfigurasi* → tempel token Fonnte → aktifkan. Token disimpan di Script Properties (tidak pernah dikirim ke browser). Atur template per-peristiwa, uji kirim di tab *Uji Coba*. Blast memakai batch 10/20/50 dengan jeda acak dan menghormati opt-out. Email memakai kuota Gmail (±100/hari untuk akun gratis).

### Migrasi data
Menu **Migrasi**: tempel link/ID spreadsheet lama → **Pindai (simulasi)** → tinjau laporan → **Jalankan**. Spreadsheet lama hanya dibaca, tidak diubah; aman dijalankan berulang (tidak membuat data ganda). Tersedia juga impor CSV untuk member, produk, dan kode akses (misalnya dari Lynk.id). Member hasil impor belum punya sandi → minta mereka memakai *Lupa Kata Sandi*.

---

## E. Fungsi Pemeliharaan (jalankan dari editor Apps Script)

Pilih fungsi di menu dropdown editor → **Jalankan** → lihat **Log Eksekusi**.

| Fungsi | Kegunaan |
|---|---|
| **`resetPasswordSuperadmin`** | Reset kata sandi superadmin bila lupa. Membuat sandi acak baru (tercetak di Log), mencabut semua sesi lama, dan membuka kunci login. Ingin sandi pilihan sendiri? Tambah Script Property `SUPERADMIN_NEW_PASSWORD` (min. 8 karakter) lebih dulu — properti dihapus otomatis setelah dipakai. |
| **`resetDataDummy`** | Hapus data contoh lalu isi ulang dari awal. Data asli tidak tersentuh. |
| **`hapusDataDummy`** | Hapus seluruh data contoh (ID berawalan `DMY`). **Jalankan sebelum go-live.** |
| **`isiDataDummy`** | Isi data contoh bila kosong. |
| **`perbaikiStruktur`** | Buat ulang sheet/kolom yang hilang tanpa menghapus data. |
| **`pasangTrigger`** | Pasang ulang 3 pemicu otomatis. |

Fungsi dummy, perbaiki struktur, dan status sistem juga tersedia di menu **Sistem** pada dasbor admin.

Akun contoh: `selsius@contoh.test` dan `yohanes@contoh.test`, sandi `Dummy#12345`. Contoh Link Bio: `/#selsius`.

## F. Daftar Cek Go-Live

1. Ganti kata sandi superadmin (menu Profil).
2. Isi Pengaturan Beranda: WhatsApp, rekening, QRIS, tagline.
3. Ganti produk/layanan/demo contoh dengan milik Anda, lalu jalankan **`hapusDataDummy`**.
4. Uji alur penuh dengan akun member biasa: daftar → beli → unggah bukti → setujui → cek email → buka aset.
5. Uji Redeem dengan satu kode.
6. Jalankan **Backup Sekarang** (menu Backup). Backup harian otomatis berjalan tiap malam pukul 23:30 WIT (14 salinan terakhir disimpan).

## G. Pemulihan Backup
Menu **Backup** mencantumkan salinan spreadsheet di Drive (folder Backup). Untuk memulihkan seluruh database: buka salinan yang diinginkan, salin **ID spreadsheet**-nya (bagian antara `/d/` dan `/edit` pada URL), lalu di editor Apps Script buka **Pengaturan Proyek → Script Properties** dan ganti nilai `SPREADSHEET_ID` dengan ID tersebut. Jalankan `perbaikiStruktur` setelahnya untuk memastikan semua sheet lengkap.

## H. Hal yang Perlu Diketahui
- Kemajuan menonton pelajaran kelas disimpan **di browser** pengguna (tidak lintas perangkat).
- Link unduhan produk terlihat oleh member yang berhak dan bisa dibagikan; untuk file sensitif, atur izin berbagi di Drive.
- Gambar bukti transfer disimpan privat di Drive; hanya pemilik pesanan dan admin yang dapat melihatnya.
- Kuota gratis Apps Script: email ±100/hari, waktu eksekusi harian terbatas — cukup untuk ratusan member.
