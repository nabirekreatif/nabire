# Panduan Instalasi — Portal Nabire Kreatif

## Pembaruan v5.1 (7 November 2026)
1. **Backend:** ganti `Kode.gs` → Terapkan → Kelola deployment → Versi baru. (Deskripsi produk kini bisa panjang hingga 20.000 karakter — sebelumnya terpotong di 1.500.)
2. **GitHub:** ekstrak `Nabire-Kreatif-Frontend-v5.1.zip` ke folder repo `nabire` (timpa), lalu `git add . && git commit -m "v5.1" && git push`.
3. **Blogger:** Tema → ▾ → Cadangkan → ▾ → Pulihkan → `Tema-Blogger-Nabire-Kreatif.xml` (aset diambil dari `https://nabirekreatif.github.io/nabire/`).

### Menulis deskripsi produk berformat
Di Admin → Produk → Ubah, kolom **Deskripsi produk** punya toolbar: **B** tebal, *I* miring, S coret, Sorot, **H** judul bagian, h subjudul, • poin, 1. urutan, ☑ centang, ❝ kutipan/catatan, ▦ tabel, — garis, 🔗 tautan, dan tab **Pratinjau**. Tekan Enter di daftar untuk lanjut otomatis. Contoh:
```
## Fitur utama
* Link bio interaktif: profil, slide promo, sosial media
* Katalog produk dengan **pencarian** dan filter

| Paket | Harga |
| --- | --- |
| Basic | Rp 149.000 |
```
Deskripsi panjang otomatis diringkas dengan tombol **Baca selengkapnya**.

### Postingan & halaman Blogger
- **Beranda** (`/`) = portal Nabire Kreatif (tidak terpengaruh postingan).
- **Postingan** = artikel Nabire Kreatif dengan tampilan rapi: label, tanggal, tombol bagikan (WhatsApp/Facebook/Telegram), ajakan pesan jasa, artikel sebelumnya/berikutnya. Daftar artikel di `/search`, per label di `/search/label/NamaLabel`, ada kotak cari dan baris label. Tautan "Artikel & Tips" muncul di footer portal.
- **Halaman** (`/p/...`) = kanvas KOSONG: tanpa header, footer, atau gaya tema. Tempel kode HTML Anda sendiri (mode *Tampilan HTML* di editor halaman) untuk landing page produk tertentu.
- Komentar Blogger tampil di bawah artikel bila diaktifkan di setelan postingan.
- Tema v5.3: susunan tata letak **sama persis dengan tema lama Anda** (bagian *header*, *artikel* berisi gadget **Postingan Blog**, *footer*). Setelah memulihkan tema, buka **Tata Letak**: di bagian *artikel* harus ada kotak **Postingan Blog**. Daftar label artikel kini dibuat otomatis (tanpa gadget Label).


## Pembaruan v5 (November 2026) — langkah singkat
1. **Backend:** ganti isi `Kode.gs` di Apps Script dengan versi baru → **Terapkan → Kelola deployment → pensil → Versi baru → Terapkan**. Kolom baru (galeri foto, link demo, grup WA) dibuat otomatis pada permintaan pertama — tidak perlu menjalankan apa pun.
2. **GitHub (aset situs):** ekstrak ZIP frontend ke folder repo Anda (timpa berkas lama; `js/config.js` di ZIP sudah berisi URL backend Anda), lalu:
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

## v5.4 — Integrasi Lynk.id (kode akses otomatis ke Gmail pembeli)

Alur: pembeli bayar di Lynk.id → Lynk.id mengirim *webhook* ke backend → backend membuat **Kode Akses** → email berisi kode + link klaim terkirim ke Gmail pembeli. Bila email pembeli sudah punya akun member, produknya langsung terbuka di akun itu.

**A. Perbarui backend (sekali)**
1. Buka proyek Apps Script → ganti isi `Kode.gs` dan `Notifikasi.gs` dengan versi baru, lalu tambah file baru `Lynk.gs` (tombol **+** → Skrip, beri nama `Lynk`).
2. **Terapkan → Kelola deployment → ✏️ Edit → Versi: Versi baru → Terapkan**. URL `/exec` tetap sama.
3. Sheet `LynkLog` dan kolom `lynk_ref` dibuat otomatis saat backend dipanggil pertama kali.

**B. Sambungkan di dasbor**
1. Dasbor Admin → **Integrasi Lynk.id** → **Buat Token Webhook** → **Salin** URL webhook.
2. Di lynk.id: **Settings → Integrations → Webhooks** → tempel URL → **Save URL**.
3. Dasbor → **Produk & Kelas** → edit tiap produk → isi **Nama produk di Lynk.id** (salin judul persis dari Lynk.id; boleh beberapa nama dipisah koma).
4. Kembali ke **Integrasi Lynk.id** → **Kirim Uji Coba** ke email Anda untuk melihat email yang diterima pembeli.

**Catatan**
- Pastikan **WhatsApp & Notifikasi → Email** aktif dan event *Pembelian di Lynk.id* dicentang (bawaan sudah aktif). Teks email bisa diubah di sana.
- Transaksi yang produk/emailnya tidak terbaca muncul berstatus **Perlu dicek** → klik **Proses Ulang**, pilih produk, lalu kirim.
- Transaksi yang sama tidak pernah membuat kode dobel. Transaksi belum lunas dilewati.
- Tombol "Test URL" di Lynk.id bisa menampilkan peringatan karena Apps Script membalas dengan *redirect*; itu normal. Cek tabel **Riwayat webhook** di dasbor: bila baris tes muncul, sambungan sudah berhasil.
- Kuota email Gmail gratis ± 100 email/hari (Google Workspace ± 1.500).

## v5.5 — Katalog rapi di HP, Aplikasi (PWA), label PO / Coming Soon

**Yang baru**
1. **Katalog di HP 2 kolom** (beranda & halaman Katalog), kartu ringkas: foto, judul 2 baris, harga, tombol Beli + ikon Kode Akses. Daftar produk di dasbor juga tampil sebagai kartu rapi di HP.
2. **Aplikasi (PWA)**: tombol **Instal App** (ikon unduh) di bilah atas. Bila HP mendukung, jendela instal langsung muncul; bila tidak, tampil panduan singkat (Android/iPhone/komputer). Di mode aplikasi: layar tidak bisa diperbesar (zoom), gulir atas-bawah & samping tetap jalan, dan saat dibuka muncul **layar pembuka** (logo + bilah progres) sampai data katalog, akun, dan tampilan siap — setelah itu halaman langsung siap dipakai.
3. **Label PO / Coming Soon**: di form produk ada **Status penjualan** (Tersedia / Pre-Order / Coming Soon) + **Keterangan PO**. Bila aktif: tombol Beli & Kode Akses hilang, diganti **Tanya via WhatsApp** (ke nomor WA admin di Pengaturan Beranda). Server juga menolak pembelian produk berlabel ini.
4. **Popup dasbor** hanya tertutup lewat tombol **X / Tutup / Batal**. Klik di luar popup atau tombol Esc tidak menutup (popup bergetar sedikit sebagai tanda) — isian form aman.
5. **Editor Link Bio** di HP layar penuh: kartu selebar layar, tab Edit/Pratinjau menempel di atas, tombol Simpan melayang di bawah, Pratinjau memenuhi layar.

**Cara memperbarui**
- **Backend:** ganti `Kode.gs` (kolom `status_po`, `po_info` dibuat otomatis) → Terapkan → Kelola deployment → Edit → Versi baru.
- **GitHub:** unggah seluruh isi zip frontend v5.5 (ada file baru: `manifest.webmanifest`, `manifest-blogger.webmanifest`, `sw.js`, `assets/icon-192.png`, `assets/icon-512.png`, `assets/icon-maskable-512.png`, `assets/apple-touch-icon.png`).
- **Blogger:** tema **perlu dipulihkan ulang** (Tema → Cadangkan → Pulihkan `blogger/Tema-Blogger-Nabire-Kreatif.xml`). Tema baru menambahkan manifest aplikasi, ikon, layar pembuka, dan kunci zoom. Struktur tata letak (header, artikel + Postingan Blog, footer) tetap sama.

**Catatan PWA**
- Di versi GitHub Pages aplikasi memakai *service worker* (`sw.js`) sehingga tampilan terbuka cepat walau sinyal lemah. Di Blogger, service worker tidak bisa dipasang (Blogger tidak mengizinkan unggah file), jadi tombol instal otomatis memakai cara bawaan browser (menu ⋮ → Instal aplikasi / Tambahkan ke layar utama) — tetap terbuka layar penuh dengan ikon sendiri.
- iPhone: pasang lewat Safari → Bagikan → Tambahkan ke Layar Utama.
- Setelah tema/situs diperbarui, aplikasi yang sudah terpasang ikut memakai versi baru saat dibuka kembali.

## v5.6 — Tombol Instal (PWA) diperbaiki & header baru

**Tombol Instal App**
- **Blogger:** manifest aplikasi sekarang dibuat langsung oleh tema di domain blog Anda (alamat awal `https://domain-anda/#/`). Cara lama (file manifest di GitHub) ditolak Chrome karena beda domain, jadi tombol instal tidak bisa jalan. Sekarang Chrome menganggap situs Blogger **bisa dipasang**, sehingga jendela instal langsung muncul saat tombol diklik.
- **GitHub Pages:** sudah memenuhi syarat instal. Jika tombol tetap menampilkan panduan, biasanya aplikasi **sudah terpasang** di perangkat itu (Chrome tidak menawarkan instal dua kali) atau browser yang dipakai bukan Chrome/Edge. Di iPhone, pemasangan selalu lewat Safari → Bagikan → Tambahkan ke Layar Utama.
- Tombol menunggu ±1,5 detik agar browser siap sebelum menampilkan panduan.

**Header publik baru**
- Satu baris rapi: logo · 5 menu inti (Beranda, Layanan, Produk, Kelas, Portofolio) · ikon Instal · Masuk/Area Member · tombol **Menu**.
- Tombol **Menu** membuka panel berisi semua halaman lengkap dengan ikon (termasuk Testimoni, Redeem Kode, Pesan Jasa Website, Artikel di Blogger), tombol Instal Aplikasi, dan Chat Admin WhatsApp.
- Tombol **Konsultasi** dan **Redeem Kode** di header dihapus (pindah ke panel Menu). Di HP/tablet menu inti disembunyikan dan cukup memakai tombol Menu.

**Cara memperbarui:** unggah isi zip frontend v5.6 ke GitHub, lalu pulihkan tema Blogger `blogger/Tema-Blogger-Nabire-Kreatif.xml` (wajib, karena perbaikan PWA ada di tema). Backend tidak berubah dari v5.5.
