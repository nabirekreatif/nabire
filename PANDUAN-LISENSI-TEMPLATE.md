# Panduan Lisensi Template Web — Nabire Kreatif (SDK v6)

Tujuan: hanya Anda yang bisa menjual template web Anda. Template tanpa lisensi tampil sebagai **DEMO**; template yang diubah **terkunci**.

## Perilaku template
| Kondisi | Yang terjadi |
|---|---|
| Domain milik Anda (mis. `nabirekreatif.com`, `link.`, `www.`) atau `localhost` | Tampil normal, lencana kecil "© Nabire Kreatif" |
| Domain pembeli **sudah diaktifkan** | Tampil normal. **Semua pengunjung tidak diminta kode.** |
| Domain **belum** berlisensi | Mode **DEMO**: hanya pita merah "DEMO" di pojok kiri atas. Pita bisa diklik untuk membuka panel aktivasi (kode + link **Beli Lisensi**). Tidak ada bilah/teks melayang di bawah. |
| Hak cipta dihapus/disembunyikan/ditutup, atau skrip/CSS template diedit | Halaman **terkunci**: pesan "Template tidak berlisensi", semua tombol/form tidak bereaksi |

Tidak ada layar kode yang menutup halaman. Pengunjung pada domain berlisensi tidak pernah melihat demo atau kotak kode.

## Alur penjualan
1. Admin → **Lisensi Template** → buat kunci (sekali) → buat produk **Template Web**, isi "Link produk" dengan link Google Drive template yang **sudah diproteksi**.
2. Pembeli membayar / Redeem kode → di **Aset Saya** muncul tombol unduh + **kode lisensi**.
3. Pembeli memasang template di domainnya. Awalnya tampil DEMO. Ia membuka **menu Lisensi** (lihat di bawah), memasukkan kode **sekali**. Domain tercatat di server; pengunjung lain otomatis lolos.
4. Pembeli bisa melepas domain lama di Aset Saya (maks 3×/30 hari). Anda bisa mencabut/memulihkan di Admin.

## Hak cipta
- Taruh teks hak cipta di footer template dengan atribut `data-nk-copy`, misalnya `<p data-nk-copy>© 2026 Nabire Kreatif · <a href="https://nabirekreatif.com">nabirekreatif.com</a></p>` (teks wajib memuat `nabirekreatif.com`).
- Bila template tidak punya slot itu, SDK menambahkan satu baris hak cipta **biasa** (tidak melayang) di akhir halaman.
- Menghapus, menyembunyikan, atau mengubah hak cipta → halaman terkunci.

## Template Blogger
```bash
node nk-protect.js tema-blogger.xml --sdk nk-license.js --blogger --obfuscate
```
Menghasilkan `tema-blogger-berlisensi.xml` (tema asli tidak diubah). SDK disisipkan langsung di tema (tanpa berkas terpisah), dan aman dijalankan ulang. Unggah lewat Blogger → Tema → ▾ → Pulihkan. Di Blogger tidak ada segel berkas (halaman dibuat server Blogger); lisensi domain, penjaga hak cipta, penguncian, dan pengaburan kode tetap aktif. Domain `*.blogspot.com` diperlakukan seperti domain pembeli lain.

## Menu memasukkan lisensi
- **Landing page (tanpa dasbor):** buka `domain-anda.com/#key` → panel kode lisensi terbuka otomatis (atau klik pita DEMO).
- **Template dengan dasbor:** tambahkan menu "Lisensi" ber-atribut `data-nk-license`:
  ```html
  <a href="#" data-nk-license>Lisensi</a>
  ```
  atau panggil `NKLicense.open()` dari halaman Lisensi buatan sendiri.
- Setelah aktif, panel yang sama menampilkan status "Lisensi aktif".

## Memproteksi template (cara cepat: pakai skill)
1. Admin → Lisensi Template → pilih produk → **Unduh nk-license.js** (berisi konfigurasi produk + SDK). Buka admin lewat **situs online** agar link beli benar (bukan `file://`).
2. Beri Claude: folder/ZIP template, `nk-license.js` hasil unduhan, dan `nk-protect.js` (ada di ZIP frontend, folder `sdk/`), lalu minta: *"proteksi template ini pakai skill proteksi-template-nabire"*.
3. Skill menyisipkan SDK, menambah menu lisensi (dasbor atau `#key`), menyegel berkas, dan menguji.

### Cara manual
```bash
node nk-protect.js ./folder-template --sdk ./nk-license.js --obfuscate
```
Perintah ini: menyisipkan `<script src="nk-license.js">` paling atas `<head>` semua halaman, menambah `<noscript>` hak cipta, menghitung **segel** SHA-256 (semua JS/CSS lokal + skrip inline), menulis `nk-license.js` final (konfigurasi + segel + hash diri). Jalankan ulang **setiap kali Anda (penjual) mengedit template**.

## Lapis pengaman
1. **Token RSA** bertanda tangan server, terikat domain — tidak bisa dipalsukan.
2. **Pengenalan domain di server** — kode cukup sekali; domain tiruan tetap DEMO.
3. **Hak cipta dalam Shadow DOM tertutup** + gaya inline `!important`: CSS/JS halaman tidak bisa menyembunyikannya; dipantau MutationObserver + denyut 1,5 detik (hapus/ubah gaya/sembunyikan/tutup → kunci).
4. **Segel berkas**: JS, CSS, skrip inline, dan daftar skrip luar diverifikasi saat dibuka; beda satu karakter (selain spasi/baris baru) → kunci.
5. **Hash diri SDK** — `nk-license.js` yang diedit → kunci.
6. **Fungsi crypto browser dipantau** (verify/digest/importKey dibajak → kunci).
7. **Penguncian total**: semua event klik/ketik/submit diblokir di fase capture, konten `inert`, layar kunci dipasang ulang bila dihapus.
8. **Obfuscate/minify** SDK agar sulit dibaca (`--obfuscate`).

## Keterbatasan (jujur)
- Proteksi di browser **tidak 100% anti-bobol**: orang yang paham bisa menghapus tag `<script src="nk-license.js">` dari HTML-nya sendiri. Lapis di atas membuat itu **lebih sulit dan lebih lama**, bukan mustahil. Untuk template bernilai tinggi, simpan logika/data penting di backend dan **jangan** sertakan di berkas unduhan.
- Pencabutan berlaku ≤24 jam (token dicek offline).
- Segel dapat memicu kunci salah bila hosting menyuntik/men-minify berkas (mis. Cloudflare Auto Minify / Rocket Loader). Matikan fitur itu, atau buat dengan `--no-seal`.
- Perlu HTTPS di domain pembeli (WebCrypto).
- Pembeli tidak bisa mengedit template (disengaja). Jika perlu varian bisa diedit, jual tanpa segel (`--no-seal`) — hak cipta & lisensi tetap dijaga.
