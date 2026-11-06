/* Ambil cuplikan statis (topbar + hero beranda) dari render SPA → dist/shell.html.
 * Ditaruh di #app pada index.html / tema Blogger supaya cat pertama langsung tampil (tanpa layar putih). */
'use strict';
const { chromium } = require(process.env.PW || '/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const FE = fs.existsSync(path.join(__dirname, '..', 'frontend', 'js')) ? path.join(__dirname, '..', 'frontend') : path.join(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const srv = http.createServer((q, s) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.dev.html'; if (p === '/js/config.js') { s.setHeader('content-type', 'text/javascript'); return s.end("window.NK_CONFIG={GAS_URL:'',BASE:''};"); } const f = path.join(FE, p); if (!fs.existsSync(f)) { s.statusCode = 404; return s.end(); } s.setHeader('content-type', mime[path.extname(f)] || 'application/octet-stream'); s.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(0, r));
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const p = await br.newPage({ viewport: { width: 1280, height: 900 } });
  await p.route(/fonts\.g|gstatic/, r => r.abort());
  await p.goto('http://127.0.0.1:' + srv.address().port + '/#/'); await p.waitForTimeout(800);
  const html = await p.evaluate(() => {
    const app = document.getElementById('app').cloneNode(true), view = app.querySelector('#view');
    const hero = view.querySelector('section.hero'); view.innerHTML = ''; if (hero) view.appendChild(hero);
    app.querySelectorAll('[style*="transition-delay"]').forEach(e => e.style.transitionDelay = '');
    app.querySelectorAll('.rv,.rv-on').forEach(e => e.classList.remove('rv', 'rv-on'));
    app.querySelectorAll('footer, .ft').forEach(e => e.remove()); const bn = app.querySelector('#banner'); if (bn) bn.innerHTML = '';
    const html = app.innerHTML.replace(/\s+style=""/g, '');
    const x = Array.from(app.childNodes).map(n => new XMLSerializer().serializeToString(n)).join('').replace(/ xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, '').replace(/\s+style=""/g, '');
    return { html, x };
  });
  fs.mkdirSync(path.join(FE, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(FE, 'dist/shell.html'), html.html); fs.writeFileSync(path.join(FE, 'dist/shell.xhtml'), html.x);
  console.log('dist/shell.html ' + (html.html.length / 1024).toFixed(1) + ' KB (+ shell.xhtml untuk Blogger)');
  await br.close(); srv.close();
})();
