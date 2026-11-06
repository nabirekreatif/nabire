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
const BASE = process.env.NK_BASE || 'https://nabirekreatif.github.io/nabire/';
const xshell = fs.existsSync(path.join(FE, 'dist/shell.xhtml')) ? fs.readFileSync(path.join(FE, 'dist/shell.xhtml'), 'utf8').replace(/src="assets\//g, 'src="' + BASE + 'assets/') : '';
const X = s => s.replace(/&/g, '&amp;');
const theme = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:js='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' lang='id' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
<meta charset='utf-8'/>
<meta content='width=device-width,initial-scale=1,viewport-fit=cover' name='viewport'/>
<b:include data='blog' name='all-head-content'/>
<b:if cond='data:view.isHomepage'>
<title>Nabire Kreatif — Membangun Masa Depan Digital Nabire</title>
<meta content='Jasa website &amp; aplikasi web untuk UMKM Nabire, katalog produk digital dan kelas online. Akses lewat transfer, QRIS, atau Redeem Kode Akses.' name='description'/>
<b:else/>
<title><data:view.title.escaped/></title>
</b:if>
<b:if cond='not data:view.isPage'>
<meta content='#0A4C7A' name='theme-color'/>
<link href='${BASE}assets/favicon.png' rel='icon' type='image/png'/>
<link href='https://fonts.googleapis.com' rel='preconnect'/><link crossorigin='anonymous' href='https://fonts.gstatic.com' rel='preconnect'/>
<link href='${X(FONTS)}' media='print' onload='this.media=&quot;all&quot;' rel='stylesheet'/>
</b:if>
<b:if cond='data:view.isHomepage'>
<link crossorigin='anonymous' href='${BASE.replace(/^(https:\/\/[^/]+).*$/, '$1')}' rel='preconnect'/>
<link crossorigin='anonymous' href='https://script.google.com' rel='preconnect'/>
<link as='script' href='${BASE}dist/nk.min.js?v=${ver}' rel='preload'/>
<link href='${BASE}dist/nk.min.css?v=${ver}' rel='stylesheet'/>
<style>html{background:#eef4ff}html.nk-ns #nk-shell{display:none}</style>
</b:if>
<b:skin><![CDATA[
/* Gaya artikel (postingan, label, pencarian). Halaman statis (/p/) sengaja kosong: tanpa gaya, header, atau footer. */
body.nk-pg{margin:0}
body.nkb{margin:0;background:#F8FAFC;color:#0b1c30;font-family:'Plus Jakarta Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.nkb *{box-sizing:border-box}.nkb a{color:inherit}
.nkb-h{background:rgba(255,255,255,.92);backdrop-filter:saturate(1.4) blur(8px);border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:20}
.nkb-hi{max-width:1080px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:12px}
.nkb-br{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;color:#0A4C7A;font-size:17px}.nkb-br img{width:36px;height:36px;border-radius:9px}.nkb-br b{color:#F28500}
.nkb-nv{margin-left:auto;display:flex;gap:4px}.nkb-nv a{text-decoration:none;font-weight:700;font-size:14px;color:#334155;padding:9px 12px;border-radius:9px}.nkb-nv a:hover,.nkb-nv a.on{background:#EAF2FB;color:#0A4C7A}
@media(max-width:560px){.nkb-nv a.hm{display:none}.nkb-br span{display:none}}
.nkb-w{max-width:1080px;margin:0 auto;padding:22px 16px 40px}
.nkb-hero{background:linear-gradient(135deg,#0A4C7A,#0d3b63);color:#fff;border-radius:20px;padding:28px 24px;margin-bottom:18px;position:relative;overflow:hidden}
.nkb-hero::after{content:"";position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(closest-side,rgba(242,133,0,.45),rgba(242,133,0,0))}
.nkb-ey{font:600 11px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#FDBA74}
.nkb-hero h1{font-size:30px;line-height:37px;margin:10px 0 6px;letter-spacing:-.02em}.nkb-hero p{margin:0;opacity:.85;max-width:560px;font-size:15px;line-height:23px}
.nkb-sf{display:flex;gap:8px;margin-top:16px;max-width:520px;position:relative;z-index:1}.nkb-sf input{flex:1;min-width:0;height:46px;border-radius:12px;border:0;padding:0 14px;font:inherit;font-size:15px}.nkb-sf button{height:46px;border:0;border-radius:12px;background:#F28500;color:#fff;font:700 14px inherit;padding:0 18px;cursor:pointer}
.nkb-lb{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 0 14px}.nkb-lb::-webkit-scrollbar{display:none}
.nkb-lb a{flex:none;text-decoration:none;font-weight:700;font-size:13px;color:#0A4C7A;background:#fff;border:1px solid #e2e8f0;border-radius:99px;padding:8px 14px;white-space:nowrap}.nkb-lb a:hover{border-color:#0A4C7A}
.nkb-g{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
.nkb-c{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(10,76,122,.06),0 6px 18px rgba(10,76,122,.06);display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s;text-decoration:none}
.nkb-c:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(10,76,122,.14)}
.nkb-th{aspect-ratio:16/9;background:linear-gradient(135deg,#0A4C7A,#F28500);display:block;overflow:hidden}.nkb-th img{width:100%;height:100%;object-fit:cover;display:block}
.nkb-cb{padding:14px 16px 18px;display:flex;flex-direction:column;gap:8px;flex:1}
.nkb-cl{display:flex;gap:6px;flex-wrap:wrap}.nkb-cl span{font:600 10.5px/1 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#D97000;background:#FFF1E0;border-radius:99px;padding:5px 8px}
.nkb-c h2{font-size:18px;line-height:25px;margin:0;color:#0b1c30;letter-spacing:-.01em}.nkb-c p{margin:0;color:#475569;font-size:14px;line-height:22px}
.nkb-c time{font:500 12px 'JetBrains Mono',monospace;color:#64748b;margin-top:auto}
.nkb-pg{display:flex;justify-content:space-between;gap:10px;margin-top:22px}.nkb-pg a{text-decoration:none;font-weight:700;color:#0A4C7A;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px}
.nkb-em{background:#fff;border-radius:16px;padding:32px;text-align:center;color:#64748b}
.nkb-a{max-width:760px;margin:0 auto}
.nkb-at{background:#fff;border-radius:20px;padding:26px 24px;box-shadow:0 1px 3px rgba(10,76,122,.06),0 6px 18px rgba(10,76,122,.05)}
@media(max-width:640px){.nkb-at{padding:20px 16px;border-radius:16px}.nkb-hero h1{font-size:24px;line-height:31px}}
.nkb-at h1{font-size:30px;line-height:38px;letter-spacing:-.02em;margin:10px 0 10px;color:#0b1c30}@media(max-width:640px){.nkb-at h1{font-size:24px;line-height:31px}}
.nkb-mt{display:flex;flex-wrap:wrap;gap:6px 14px;font:500 12.5px 'JetBrains Mono',monospace;color:#64748b;padding-bottom:16px;border-bottom:1px solid #e2e8f0;margin-bottom:18px}
.nkb-al{display:flex;gap:6px;flex-wrap:wrap}.nkb-al a{text-decoration:none;font:600 11px/1 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#D97000;background:#FFF1E0;border-radius:99px;padding:6px 9px}
.nkb-bd{font-size:16.5px;line-height:1.8;color:#334155;overflow-wrap:anywhere}
.nkb-bd h2,.nkb-bd h3,.nkb-bd h4{color:#0b1c30;line-height:1.3;margin:1.6em 0 .5em}.nkb-bd h2{font-size:23px}.nkb-bd h3{font-size:20px}
.nkb-bd a{color:#0A4C7A;font-weight:600}.nkb-bd img{max-width:100%;height:auto;border-radius:12px}
.nkb-bd blockquote{margin:1em 0;padding:12px 16px;border-left:4px solid #F28500;background:#FFF7ED;border-radius:0 10px 10px 0}
.nkb-bd table{width:100%;border-collapse:collapse;display:block;overflow-x:auto}.nkb-bd th,.nkb-bd td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}.nkb-bd th{background:#F1F5F9}
.nkb-bd pre,.nkb-bd code{font-family:'JetBrains Mono',monospace;background:#F1F5F9;border-radius:8px}.nkb-bd pre{padding:14px;overflow-x:auto}
.nkb-sh{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px;padding-top:16px;border-top:1px solid #e2e8f0;align-items:center}
.nkb-sh span{font-weight:700;font-size:13px;color:#64748b;margin-right:4px}.nkb-sh a{text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;padding:9px 14px;background:#EAF2FB;color:#0A4C7A}.nkb-sh a.wa{background:#22C55E;color:#fff}
.nkb-cta{margin-top:18px;background:linear-gradient(135deg,#FFF1E0,#fff);border:1px solid #FED7AA;border-radius:16px;padding:18px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.nkb-cta b{color:#0b1c30}.nkb-cta a{text-decoration:none;background:#F28500;color:#fff;font-weight:800;border-radius:12px;padding:12px 16px}
.nkb-f{text-align:center;color:#64748b;font-size:13px;padding:22px 16px 34px}.nkb-f a{color:#0A4C7A;font-weight:700;text-decoration:none}
]]></b:skin>
<b:if cond='data:view.isHomepage'>
<script>//<![CDATA[
window.NK_CONFIG={GAS_URL:${JSON.stringify(GAS)},GOOGLE_CLIENT_ID:${JSON.stringify(GCID)},BASE:${JSON.stringify(BASE)},BLOGGER:true};
${SHELL_GUARD}
//]]></script>
<script defer='defer' src='${BASE}dist/nk.min.js?v=${ver}'></script>
</b:if>
</head>
<body>
<b:class cond='data:view.isPage' name='nk-pg'/>
<b:class cond='data:view.isPost or (data:view.isMultipleItems and not data:view.isHomepage)' name='nkb'/>
<b:if cond='data:view.isHomepage'>
<div id='app'><div id='nk-shell'>${xshell}</div></div>
<script>//<![CDATA[
['net','toasts','modal-root'].forEach(function(id){if(!document.getElementById(id)){var e=document.createElement('div');e.id=id;if(id==='net')e.className='net';if(id==='toasts')e.setAttribute('aria-live','polite');document.body.appendChild(e);}});
//]]></script>
<noscript><div style='padding:24px;text-align:center'>Aktifkan JavaScript untuk membuka Nabire Kreatif.</div></noscript>
</b:if>
<b:if cond='data:view.isPost or (data:view.isMultipleItems and not data:view.isHomepage)'>
<header class='nkb-h'><div class='nkb-hi'><a class='nkb-br' href='/'><img alt='' height='36' src='${BASE}assets/logo-icon.png' width='36'/><span>Nabire <b>Kreatif</b></span></a><nav class='nkb-nv'><a class='hm' href='/'>Beranda</a><a href='/#/katalog'>Katalog</a><a class='on' href='/search'>Artikel</a></nav></div></header>
</b:if>
<b:section class='nkb-ls' id='labels' maxwidgets='1' showaddelement='no'>
<b:widget id='Label1' locked='false' title='Label' type='Label' version='2' visible='true'>
<b:widget-settings>
<b:widget-setting name='sorting'>ALPHA</b:widget-setting>
<b:widget-setting name='display'>LIST</b:widget-setting>
<b:widget-setting name='selectedLabelsList'/>
<b:widget-setting name='showType'>ALL</b:widget-setting>
<b:widget-setting name='showFreqNumbers'>false</b:widget-setting>
</b:widget-settings>
<b:includable id='main'>
<b:if cond='data:view.isMultipleItems and not data:view.isHomepage'>
<div class='nkb-w' style='padding-bottom:0'>
<div class='nkb-hero'><div class='nkb-ey'>Artikel &amp; Tips</div>
<b:if cond='data:view.search.label'><h1>Label: <data:view.search.label/></h1><b:elseif cond='data:view.search.query'/><h1>Hasil cari: <data:view.search.query/></h1><b:else/><h1>Belajar Digital bersama Nabire Kreatif</h1></b:if>
<p>Panduan website, aplikasi web, pemasaran online, dan tips UMKM Papua.</p>
<form action='/search' class='nkb-sf' method='get'><input aria-label='Cari artikel' name='q' placeholder='Cari artikel…' type='search'/><button type='submit'>Cari</button></form></div>
<nav aria-label='Label artikel' class='nkb-lb'><a href='/search'>Semua</a><b:loop values='data:labels' var='label'><a expr:href='data:label.url'><data:label.name/></a></b:loop></nav>
</div>
</b:if>
</b:includable>
</b:widget>
</b:section>
<b:section class='nkb-main' id='main' maxwidgets='1' showaddelement='no'>
<b:widget id='Blog1' locked='true' title='Postingan Blog' type='Blog' version='2' visible='true'>
<b:includable id='main'>
<b:if cond='data:view.isPage'>
<b:loop values='data:posts' var='post'><data:post.body/></b:loop>
<b:elseif cond='data:view.isPost'/>
<div class='nkb-w'><b:loop values='data:posts' var='post'>
<article class='nkb-a'><div class='nkb-at'>
<b:if cond='data:post.labels'><div class='nkb-al'><b:loop values='data:post.labels' var='label'><a expr:href='data:label.url'><data:label.name/></a></b:loop></div></b:if>
<h1><data:post.title/></h1>
<div class='nkb-mt'><time expr:datetime='data:post.date.iso8601'><data:post.date/></time><span>oleh <data:post.author.name/></span></div>
<div class='nkb-bd'><data:post.body/></div>
<div class='nkb-sh'><span>Bagikan:</span><a class='wa' expr:href='&quot;https://wa.me/?text=&quot; + data:post.url' rel='noopener' target='_blank'>WhatsApp</a><a expr:href='&quot;https://www.facebook.com/sharer/sharer.php?u=&quot; + data:post.url' rel='noopener' target='_blank'>Facebook</a><a expr:href='&quot;https://t.me/share/url?url=&quot; + data:post.url' rel='noopener' target='_blank'>Telegram</a></div>
</div>
<div class='nkb-cta'><div><b>Butuh website atau aplikasi untuk usaha Anda?</b><br/><small>Konsultasi gratis dengan tim Nabire Kreatif.</small></div><a href='/#/layanan'>Pesan Jasa Website</a></div>
<nav class='nkb-pg'><b:if cond='data:newerPageUrl'><a expr:href='data:newerPageUrl'>&#8592; Artikel lebih baru</a><b:else/><span/></b:if><b:if cond='data:olderPageUrl'><a expr:href='data:olderPageUrl'>Artikel sebelumnya &#8594;</a></b:if></nav>
</article>
</b:loop></div>
<b:elseif cond='data:view.isMultipleItems and not data:view.isHomepage'/>
<div class='nkb-w' style='padding-top:0'>
<b:if cond='data:posts'>
<div class='nkb-g'><b:loop values='data:posts' var='post'>
<a class='nkb-c' expr:href='data:post.url'>
<div class='nkb-th'><b:if cond='data:post.featuredImage'><img alt='' expr:src='resizeImage(data:post.featuredImage, 640, &quot;16:9&quot;)' loading='lazy'/></b:if></div>
<div class='nkb-cb'><b:if cond='data:post.labels'><div class='nkb-cl'><b:loop index='i' values='data:post.labels' var='label'><b:if cond='data:i lt 2'><span><data:label.name/></span></b:if></b:loop></div></b:if>
<h2><data:post.title/></h2><p><b:eval expr='snippet(data:post.body, {length: 150, links: false, linebreaks: false})'/></p><time expr:datetime='data:post.date.iso8601'><data:post.date/></time></div>
</a>
</b:loop></div>
<b:else/><div class='nkb-em'>Belum ada artikel di sini.</div>
</b:if>
<nav class='nkb-pg'><b:if cond='data:newerPageUrl'><a expr:href='data:newerPageUrl'>&#8592; Lebih baru</a><b:else/><span/></b:if><b:if cond='data:olderPageUrl'><a expr:href='data:olderPageUrl'>Lebih lama &#8594;</a></b:if></nav>
</div>
</b:if>
</b:includable>
</b:widget>
</b:section>
<b:if cond='data:view.isPost or (data:view.isMultipleItems and not data:view.isHomepage)'>
<footer class='nkb-f'>&#169; Nabire Kreatif · <a href='/'>nabirekreatif.com</a> · <a href='/search'>Artikel</a></footer>
</b:if>
</body>
</html>
`;
fs.mkdirSync(path.join(FE, 'blogger'), { recursive: true });
fs.writeFileSync(path.join(FE, 'blogger', 'Tema-Blogger-Nabire-Kreatif.xml'), theme);
fs.writeFileSync(path.join(FE, 'dist/VERSION'), ver + '\n');
console.log('dist/nk.min.js ' + (js.length / 1024).toFixed(1) + ' KB · app2 ' + (app2.length / 1024).toFixed(1) + ' KB · dist/nk.min.css ' + (css.length / 1024).toFixed(1) + ' KB · sdk ' + (sdk.length / 1024).toFixed(1) + ' KB · versi ' + ver);
