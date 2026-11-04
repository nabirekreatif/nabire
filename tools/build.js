/* Build Nabire Kreatif: bundel + minify JS/CSS portal ke dist/, dan SDK lisensi ke sdk/nk-license.js
 * Pakai: node tools/build.js   (butuh esbuild: npm i -g esbuild, atau NODE_PATH ke esbuild) */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
let eb; try { eb = require('esbuild'); } catch (e) { console.error('esbuild tidak ditemukan. Jalankan: npm i esbuild'); process.exit(1); }
const FE = fs.existsSync(path.join(__dirname, '..', 'frontend', 'js')) ? path.join(__dirname, '..', 'frontend') : path.join(__dirname, '..'), J = f => fs.readFileSync(path.join(FE, f), 'utf8');
const MAIN = ['core', 'pages-public', 'pages-member'].map(n => 'js/' + n + '.js'), APP2 = ['pages-admin', 'pages-admin2', 'pages-bio', 'pages-lisensi'].map(n => 'js/' + n + '.js');
fs.mkdirSync(path.join(FE, 'dist'), { recursive: true });
const min = src => eb.transformSync(src, { minify: true, target: 'es2019', legalComments: 'none' }).code;
const app2 = min(APP2.map(J).join(';\n'));
const css = eb.transformSync(J('css/style.css'), { loader: 'css', minify: true, target: ['chrome90', 'safari14'] }).code;
const ver = crypto.createHash('sha1').update(MAIN.map(J).join('') + app2 + css).digest('hex').slice(0, 8);
const js = min('window.NK_BUNDLE={v:' + JSON.stringify(ver) + '};\n' + MAIN.map(J).join(';\n') + ';\nif(window.NK&&!window.NK_NOAUTO)NK.start();');
fs.writeFileSync(path.join(FE, 'dist/nk.min.js'), js); fs.writeFileSync(path.join(FE, 'dist/nk.app2.min.js'), app2); fs.writeFileSync(path.join(FE, 'dist/nk.min.css'), css);
const sdk = eb.transformSync(J('sdk/nk-license.src.js'), { minify: true, target: 'es2018', legalComments: 'inline' }).code;
if (/\]\]>/.test(sdk)) throw new Error('SDK memuat "]]>" — tidak aman untuk Blogger');
fs.writeFileSync(path.join(FE, 'sdk/nk-license.js'), sdk);
/* index.html: cuplikan statis (dist/shell.html) agar tidak ada layar putih; CSS/JS ringan & non-blocking */
const shell = fs.existsSync(path.join(FE, 'dist/shell.html')) ? fs.readFileSync(path.join(FE, 'dist/shell.html'), 'utf8') : '';
const FONTS = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
const SHELL_GUARD = "(function(h){if(h&&!/^#\\/?(layanan|demo|testimoni|jasa)?(\\?.*)?$/.test(h))document.documentElement.className+=' nk-ns'})(location.hash)";
const index = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Nabire Kreatif — Membangun Masa Depan Digital Nabire</title>
<meta name="description" content="Jasa website & aplikasi web untuk UMKM Nabire, katalog produk digital dan kelas online. Akses lewat transfer, QRIS, atau Redeem Kode Akses.">
<meta name="theme-color" content="#0A4C7A">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://script.google.com" crossorigin><link rel="dns-prefetch" href="https://script.googleusercontent.com">
<link rel="preload" href="dist/nk.min.js?v=${ver}" as="script">
<link rel="stylesheet" href="dist/nk.min.css?v=${ver}">
<link rel="stylesheet" href="${FONTS}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<style>html{background:#eef4ff}html.nk-ns #nk-shell{display:none}</style>
<script>${SHELL_GUARD}</script>
</head>
<body>
<div id="net" class="net"></div>
<div id="app"><div id="nk-shell">${shell}</div></div>
<div id="toasts" aria-live="polite"></div>
<div id="modal-root"></div>
<noscript><div style="padding:24px;text-align:center">Aktifkan JavaScript untuk membuka Nabire Kreatif.</div></noscript>
<script src="js/config.js?v=${ver}" defer></script>
<script src="dist/nk.min.js?v=${ver}" defer></script>
</body>
</html>
`;
fs.writeFileSync(path.join(FE, 'index.html'), index);

/* ---- Tema Blogger (beranda = portal; halaman /p/ & postingan = isi Blogger) ---- */
const cfgSrc = J('js/config.js'), GAS = (cfgSrc.match(/GAS_URL:\s*'([^']*)'/) || [])[1] || '', GCID = (cfgSrc.match(/GOOGLE_CLIENT_ID:\s*'([^']*)'/) || [])[1] || '';
const BASE = process.env.NK_BASE || 'https://nabirekreatif.github.io/nabire-kreatif/';
const xshell = fs.existsSync(path.join(FE, 'dist/shell.xhtml')) ? fs.readFileSync(path.join(FE, 'dist/shell.xhtml'), 'utf8').replace(/src="assets\//g, 'src="' + BASE + 'assets/') : '';
const X = s => s.replace(/&/g, '&amp;');
const theme = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:js='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' lang='id' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
<meta charset='utf-8'/>
<meta content='width=device-width,initial-scale=1,viewport-fit=cover' name='viewport'/>
<meta content='#0A4C7A' name='theme-color'/>
<b:include data='blog' name='all-head-content'/>
<b:if cond='data:view.isHomepage'>
<title>Nabire Kreatif — Membangun Masa Depan Digital Nabire</title>
<meta content='Jasa website &amp; aplikasi web untuk UMKM Nabire, katalog produk digital dan kelas online. Akses lewat transfer, QRIS, atau Redeem Kode Akses.' name='description'/>
<b:else/>
<title><data:view.title.escaped/> · Nabire Kreatif</title>
</b:if>
<link href='${BASE}assets/favicon.png' rel='icon' type='image/png'/>
<link href='https://fonts.googleapis.com' rel='preconnect'/><link crossorigin='anonymous' href='https://fonts.gstatic.com' rel='preconnect'/>
<link crossorigin='anonymous' href='https://nabirekreatif.github.io' rel='preconnect'/>
<b:if cond='data:view.isHomepage'>
<link crossorigin='anonymous' href='https://script.google.com' rel='preconnect'/>
<link as='script' href='${BASE}dist/nk.min.js?v=${ver}' rel='preload'/>
<link href='${BASE}dist/nk.min.css?v=${ver}' rel='stylesheet'/>
</b:if>
<link href='${X(FONTS)}' media='print' onload='this.media=&quot;all&quot;' rel='stylesheet'/>
<b:skin><![CDATA[
html{background:#eef4ff}html.nk-ns #nk-shell{display:none}
body.nkp-w{font-family:'Plus Jakarta Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0b1c30;background:#F8FAFC;min-height:100vh;margin:0}
.nkp-h{background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:5}
.nkp-h div{max-width:900px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:12px}
.nkp-h a{color:#0A4C7A;text-decoration:none;font-weight:800}.nkp-h img{width:34px;height:34px;border-radius:8px}
.nkp-h .bk{margin-left:auto;font-size:14px;background:#eaf2fb;padding:10px 14px;border-radius:8px}
.nkp{max-width:900px;margin:0 auto;padding:24px 16px 40px}
.nkp-a{background:#fff;border-radius:16px;padding:22px;box-shadow:0 1px 3px rgba(10,76,122,.06),0 4px 12px rgba(10,76,122,.04);margin-bottom:18px}
.nkp-t{font-size:26px;line-height:34px;color:#0A4C7A;margin:0 0 12px}.nkp-b{font-size:16px;line-height:27px;overflow-wrap:anywhere}.nkp-b img{max-width:100%;height:auto;border-radius:10px}
.nkp-f{text-align:center;color:#64748b;font-size:13px;padding:20px 16px 30px}.nkp-f a{color:inherit;font-weight:700}
]]></b:skin>
<b:if cond='data:view.isHomepage'>
<script>//<![CDATA[
window.NK_CONFIG={GAS_URL:${JSON.stringify(GAS)},GOOGLE_CLIENT_ID:${JSON.stringify(GCID)},BASE:${JSON.stringify(BASE)}};
${SHELL_GUARD}
//]]></script>
<script defer='defer' src='${BASE}dist/nk.min.js?v=${ver}'></script>
</b:if>
</head>
<body>
<b:class cond='!data:view.isHomepage' name='nkp-w'/>
<b:if cond='data:view.isHomepage'>
<div id='app'><div id='nk-shell'>${xshell}</div></div>
<script>//<![CDATA[
['net','toasts','modal-root'].forEach(function(id){if(!document.getElementById(id)){var e=document.createElement('div');e.id=id;if(id==='net')e.className='net';if(id==='toasts')e.setAttribute('aria-live','polite');document.body.appendChild(e);}});
//]]></script>
<noscript><div style='padding:24px;text-align:center'>Aktifkan JavaScript untuk membuka Nabire Kreatif.</div></noscript>
<b:else/>
<header class='nkp-h'><div><a href='/'><img alt='' src='${BASE}assets/logo-icon.png'/></a><a href='/'>Nabire Kreatif</a><a class='bk' href='/#/katalog'>Katalog</a></div></header>
</b:if>
<b:section class='nkp' id='main' maxwidgets='1' showaddelement='no'>
<b:widget id='Blog1' locked='true' title='Postingan Blog' type='Blog' version='2' visible='true'>
<b:includable id='main'>
<b:if cond='!data:view.isHomepage'>
<b:loop values='data:posts' var='post'>
<article class='nkp-a'>
<h1 class='nkp-t'><data:post.title/></h1>
<div class='nkp-b'><data:post.body/></div>
</article>
</b:loop>
</b:if>
</b:includable>
</b:widget>
</b:section>
<b:if cond='!data:view.isHomepage'>
<footer class='nkp-f'>&#169; Nabire Kreatif · <a href='/'>nabirekreatif.com</a></footer>
</b:if>
</body>
</html>
`;
fs.mkdirSync(path.join(FE, 'blogger'), { recursive: true });
fs.writeFileSync(path.join(FE, 'blogger', 'Tema-Blogger-Nabire-Kreatif.xml'), theme);
fs.writeFileSync(path.join(FE, 'dist/VERSION'), ver + '\n');
console.log('dist/nk.min.js ' + (js.length / 1024).toFixed(1) + ' KB · app2 ' + (app2.length / 1024).toFixed(1) + ' KB · dist/nk.min.css ' + (css.length / 1024).toFixed(1) + ' KB · sdk ' + (sdk.length / 1024).toFixed(1) + ' KB · versi ' + ver);
