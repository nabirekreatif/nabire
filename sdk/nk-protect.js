#!/usr/bin/env node
/* nk-protect.js — menyegel template web dengan lisensi Nabire Kreatif
 *
 * Pakai:  node nk-protect.js <folder-template> --sdk <nk-license.js-dari-admin> [--obfuscate] [--no-seal] [--no-page-seal]
 *         node nk-protect.js <tema-blogger.xml> --sdk <nk-license.js-dari-admin> --blogger [--obfuscate]
 *
 *  Mode Blogger: SDK disisipkan INLINE (CDATA) paling atas <head> tema XML, + <noscript> hak cipta.
 *  Halaman Blogger dibuat dinamis oleh server, jadi segel berkas tidak dipakai; perlindungan = lisensi domain,
 *  penjaga hak cipta, penguncian, dan pengaburan kode. Hasil: <nama>-berlisensi.xml (tema asli tidak diubah).
 *
 *  1. Menyisipkan <script src="nk-license.js"> paling atas <head> di setiap .html (idempoten).
 *  2. Menambah <noscript> hak cipta + komentar hak cipta.
 *  3. Menghitung SEGEL (SHA-256) semua berkas JS/CSS lokal + skrip inline tiap halaman.
 *  4. Menulis <folder>/nk-license.js = baris konfigurasi (window.NKL + segel + hash diri) + badan SDK.
 *  5. (opsional) --obfuscate: kaburkan badan SDK dengan javascript-obfuscator (npx) sebelum dihash.
 *
 * Jalankan ulang setiap kali template diedit oleh PENJUAL (segel harus dihitung ulang).
 * Hanya Node.js bawaan (>=16). Tidak mengubah berkas selain .html dan nk-license.js.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process'), os = require('os');

const args = process.argv.slice(2), flag = n => args.includes(n), opt = n => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : ''; };
const dir = args.find(a => !a.startsWith('--') && a !== opt('--sdk'));
const sdkFile = opt('--sdk');
if (!dir || !sdkFile) { console.error('Pemakaian: node nk-protect.js <folder-template> --sdk <nk-license.js> [--obfuscate] [--no-seal] [--no-page-seal]'); process.exit(1); }
const ROOT = path.resolve(dir), BLOGGER = flag('--blogger') || /\.xml$/i.test(dir);
if (!fs.existsSync(ROOT)) { console.error('Folder/berkas template tidak ditemukan: ' + ROOT); process.exit(1); }
if (!BLOGGER && !fs.statSync(ROOT).isDirectory()) { console.error('Untuk tema Blogger berikan berkas .xml + --blogger. Selain itu berikan folder template.'); process.exit(1); }

const sha = t => crypto.createHash('sha256').update(t, 'utf8').digest('hex');
const norm = s => String(s).replace(/^\uFEFF/, '').replace(/\r/g, '').replace(/\s+/g, ' ').trim();

/* ---- 1. baca SDK dari admin: baris 1 = konfigurasi ---- */
const sdkRaw = fs.readFileSync(path.resolve(sdkFile), 'utf8');
const m = sdkRaw.match(/^window\.NKL=(\{.*\});?[ \t]*\r?\n/);
if (!m) { console.error('Berkas SDK harus berasal dari Admin → Lisensi Template → "Unduh nk-license.js" (baris pertama memuat window.NKL={...}).'); process.exit(1); }
const cfg = JSON.parse(m[1]); let body = sdkRaw.slice(m[0].length);
if (!cfg.api || !cfg.pub || !cfg.pid) { console.error('Konfigurasi pada nk-license.js tidak lengkap (api/pub/pid). Unduh ulang dari admin setelah kunci dibuat.'); process.exit(1); }
if (/^file:/.test(cfg.beli || '')) console.warn('! PERINGATAN: "beli" masih berupa alamat file:// — buka admin lewat situs online lalu unduh ulang agar link beli benar.');

const NOSCRIPT = '<noscript><div style="background:#0b1220;color:#fff;text-align:center;padding:12px;font:13px system-ui">\u00A9 Nabire Kreatif \u2014 Template ini memerlukan JavaScript &amp; lisensi. <a style="color:#F28500" href="https://nabirekreatif.com">nabirekreatif.com</a></div></noscript>';
/* ---- 3. kaburkan badan SDK (opsional) ---- */
function obfuscate() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nkp-')), inp = path.join(tmp, 'in.js'), out = path.join(tmp, 'out.js'); fs.writeFileSync(inp, body);
  const r = cp.spawnSync('npx', ['--yes', 'javascript-obfuscator@4', inp, '--output', out, '--compact', 'true', '--string-array', 'true', '--string-array-encoding', 'base64', '--string-array-threshold', '1', '--rename-globals', 'false', '--identifier-names-generator', 'hexadecimal', '--control-flow-flattening', 'true', '--control-flow-flattening-threshold', '0.5', '--dead-code-injection', 'false', '--self-defending', 'false', '--unicode-escape-sequence', 'false'], { encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(out)) {
    /* cadangan: minify + mangle nama variabel dengan esbuild (tersedia lokal atau lewat npx) */
    let done = false;
    try { const eb = require('esbuild'); fs.writeFileSync(out, eb.transformSync(body, { minify: true, target: 'es2018', legalComments: 'none' }).code); done = true; } catch (e) { }
    if (!done) { const r2 = cp.spawnSync('npx', ['--yes', 'esbuild@0.21', inp, '--minify', '--target=es2018', '--legal-comments=none', '--outfile=' + out], { encoding: 'utf8' }); done = r2.status === 0 && fs.existsSync(out); }
    if (!done) { console.error('Obfuscate/minify gagal (butuh koneksi npm untuk javascript-obfuscator atau esbuild):\n' + (r.stderr || r.stdout)); process.exit(1); }
    console.log('! javascript-obfuscator tidak tersedia \u2192 memakai minify esbuild (lapis pengaman lebih ringan).');
  }
  body = fs.readFileSync(out, 'utf8').replace(/^\s+/, ''); console.log('\u2713 SDK dikaburkan.');
}


/* ---- MODE BLOGGER ---- */
if (BLOGGER) {
  if (flag('--obfuscate')) obfuscate();
  let xml = fs.readFileSync(ROOT, 'utf8');
  if (!/<b:skin/i.test(xml) || !/<head>/i.test(xml)) { console.error('Berkas bukan tema Blogger (tidak ada <head> / <b:skin>). Unduh dari Blogger → Tema → Cadangkan.'); process.exit(1); }
  xml = xml.replace(/<!--NKL-START-->[\s\S]*?<!--NKL-END-->\s*/g, '');
  if (/\]\]>/.test(body)) { console.error('Kode SDK memuat "]]>" sehingga tidak aman untuk CDATA Blogger. Coba tanpa --obfuscate.'); process.exit(1); }
  body = body.replace(/<\/script/gi, '<\\/script');
  delete cfg.seal; delete cfg.self; cfg.v = 6; cfg.blogger = 1;
  const block = '<!--NKL-START--><script>//<![CDATA[\nwindow.NKL=' + JSON.stringify(cfg) + ';\n' + body + '\n//]]></script><!--NKL-END-->\n';
  xml = xml.replace(/<head>/i, x => x + '\n' + block);
  if (!/Template ini memerlukan JavaScript/.test(xml)) xml = xml.replace(/<\/body>/i, NOSCRIPT + '\n</body>');
  const out = ROOT.replace(/(\.xml)?$/i, '-berlisensi.xml');
  fs.writeFileSync(out, xml);
  console.log('✓ Tema Blogger diproteksi: ' + out);
  console.log(/data-nk-copy/.test(xml) ? '  Slot hak cipta [data-nk-copy] ditemukan di tema.' : "  ! Tidak ada slot data-nk-copy: SDK akan menambah baris hak cipta di akhir halaman. Disarankan tambahkan di footer tema:\n    <div data-nk-copy=''>&#169; Nabire Kreatif &#183; <a href='https://nabirekreatif.com'>nabirekreatif.com</a></div>");
  console.log('  Unggah: Blogger → Tema → ▾ → Pulihkan → pilih berkas di atas.');
  process.exit(0);
}
/* ---- 2. temukan halaman HTML ---- */
function walk(d, out) { for (const f of fs.readdirSync(d)) { if (f === 'node_modules' || f.startsWith('.')) continue; const p = path.join(d, f), s = fs.statSync(p); if (s.isDirectory()) walk(p, out); else out.push(p); } return out; }
const files = walk(ROOT, []), htmls = files.filter(f => /\.html?$/i.test(f));
if (!htmls.length) { console.error('Tidak ada berkas .html di folder.'); process.exit(1); }

const isLocal = u => u && !/^([a-z][a-z0-9+.\-]*:|\/\/|#|data:)/i.test(u);
const cleanUrl = u => u.split('#')[0].split('?')[0];
const unent = s => s.replace(/&amp;/g, '&');
const attr = (tag, name) => { const r = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); return r ? unent(r[1] != null ? r[1] : r[2] != null ? r[2] : r[3]) : null; };

const seal = { f: [], i: {} }, sealFiles = new Map();

for (const hf of htmls) {
  let html = fs.readFileSync(hf, 'utf8'); const relDir = path.relative(path.dirname(hf), ROOT).split(path.sep).join('/'), pre = relDir ? relDir + '/' : '';
  /* sisipkan SDK paling atas <head> */
  const tag = '<script src="' + pre + 'nk-license.js"></script>';
  if (!/nk-license\.js/.test(html)) {
    if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, x => x + '\n  <!-- \u00A9 Nabire Kreatif \u2014 template berlisensi. Dilarang mengubah/menghapus pelindung lisensi. -->\n  ' + tag);
    else html = tag + '\n' + html;
  }
  if (!/Template ini memerlukan JavaScript/.test(html)) html = html.replace(/<\/body>/i, NOSCRIPT + '\n</body>');
  fs.writeFileSync(hf, html);
  /* kumpulkan segel */
  const o = { s: [], c: [], i: [] };
  for (const mm of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const t = (attr('<x ' + mm[1], 'type') || '').toLowerCase(); if (t && !/javascript|module/.test(t)) continue;
    const src = attr('<x ' + mm[1], 'src');
    if (src != null) { o.s.push(src); if (isLocal(src) && !/(^|\/)(nk-license|config)\.js$/.test(cleanUrl(src))) sealFiles.set(path.resolve(path.dirname(hf), cleanUrl(src)), 1); }
    else o.i.push(norm(mm[2]));
  }
  for (const mm of html.matchAll(/<link\b[^>]*>/gi)) {
    if (!/rel\s*=\s*["']?[^"'>]*stylesheet/i.test(mm[0])) continue; const href = attr(mm[0], 'href'); if (href == null) continue;
    o.c.push(href); if (isLocal(href)) sealFiles.set(path.resolve(path.dirname(hf), cleanUrl(href)), 1);
  }
  if (!flag('--no-page-seal')) seal.i[path.relative(ROOT, hf).split(path.sep).join('/')] = sha(JSON.stringify(o));
}
for (const f of sealFiles.keys()) {
  if (!fs.existsSync(f)) { console.warn('! Berkas direferensikan tapi tidak ada: ' + path.relative(ROOT, f)); continue; }
  seal.f.push({ u: path.relative(ROOT, f).split(path.sep).join('/'), h: sha(norm(fs.readFileSync(f, 'utf8'))) });
}

if (flag('--obfuscate')) obfuscate();

/* ---- 4. tulis nk-license.js final ---- */
cfg.self = sha(norm(body)); cfg.v = 6;
if (flag('--no-seal')) delete cfg.seal; else cfg.seal = seal;
fs.writeFileSync(path.join(ROOT, 'nk-license.js'), 'window.NKL=' + JSON.stringify(cfg) + ';\n' + body);

console.log('\u2713 Template disegel: ' + ROOT);
console.log('  Halaman HTML  : ' + htmls.map(h => path.relative(ROOT, h)).join(', '));
console.log('  Berkas disegel: ' + (seal.f.length ? seal.f.map(x => x.u).join(', ') : '(tidak ada JS/CSS lokal)'));
console.log('  Hash SDK      : ' + cfg.self.slice(0, 16) + '\u2026');
console.log('  Produk (pid)  : ' + cfg.pid + ' \u00B7 domain pemilik: ' + (cfg.owner || []).join(', '));
if (!htmls.some(h => /data-nk-copy/.test(fs.readFileSync(h, 'utf8')))) console.log("! Tidak ada slot hak cipta data-nk-copy di footer: SDK akan menambah baris '\u00A9 Nabire Kreatif \u00B7 nabirekreatif.com' di akhir halaman.");
console.log('\nCatatan: jangan minify/ubah berkas setelah disegel; jalankan ulang alat ini bila Anda (penjual) mengedit template.');
