/* Halaman publik: beranda, katalog, produk, redeem, auth, checkout */
(function (w) {
  'use strict';
  const N = w.NK, { esc, rp, ic, ACT, FORM, INPUT, route, go, toast, api, use, setting, safeUrl, S } = N;
  const SS = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }, del(k) { try { sessionStorage.removeItem(k); } catch (e) { } } };

  /* ---------- komponen bersama ---------- */
  const SVC_ICON = [[/landing|promosi/i, 'globe'], [/toko|online|belanja/i, 'cart'], [/profile|company|profil/i, 'file'], [/undangan/i, 'mail'], [/kasir|pos|aplikasi/i, 'server']];
  const svcIcon = n => { for (const x of SVC_ICON) if (x[0].test(n)) return x[1]; return 'globe'; };
  function owned(id) { const b = N.bootData(); return !!(b && b.library && b.library.some(p => p.id === id)); }
  function pending(id) { const b = N.bootData(); return !!(b && b.orders && b.orders.some(o => o.id_produk === id && o.status === 'Menunggu')); }
  const imgsOf = p => { const a = [safeUrl(p.cover_url)].concat((Array.isArray(p.galeri) ? p.galeri : []).map(safeUrl)).filter(Boolean); return a.filter((u, i) => a.indexOf(u) === i); };
  function coverHTML(p, chip) {
    const img = safeUrl(p.cover_url) || imgsOf(p)[0], n = imgsOf(p).length;
    return '<div class="cover">' + (n > 1 ? '<span class="chip pcnt">' + N.ic('image', 'sm') + n + '</span>' : '') + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">' : N.ic(p.tipe === 'kelas' ? 'video' : 'box', 'lg')) + '<span class="chip">' + N.ic(p.tipe === 'kelas' ? 'video' : 'file', 'sm') + esc(chip || (p.tipe === 'kelas' ? 'Kelas Video' : 'Produk Digital')) + '</span>' + (p.badge ? '<span class="chip r">' + esc(p.badge) + '</span>' : '') + '</div>';
  }
  function pcard(p) {
    const disc = Number(p.harga_coret) > Number(p.harga) ? Math.round((1 - p.harga / p.harga_coret) * 100) : 0, own = owned(p.id), pend = pending(p.id);
    const meta = p.tipe_file === 'template' ? '<span>' + ic('code', 'sm') + 'Kode lisensi per domain</span><span>' + ic('download', 'sm') + 'Unduh via Drive</span>' : p.tipe_file === 'linkbio' ? '<span>' + ic('link', 'sm') + 'Editor mandiri + 6 produk</span><span>' + ic('shield', 'sm') + 'Akses Selamanya</span>' : p.tipe === 'kelas' ? '<span>' + ic('video', 'sm') + (p.modul || 0) + ' Modul Video</span><span>' + ic('users', 'sm') + 'Akses Selamanya</span>' : '<span>' + ic(p.tipe_file === 'pdf' ? 'eye' : 'download', 'sm') + (p.tipe_file === 'pdf' ? 'Baca langsung di web' : 'Unduh via Drive') + '</span><span>' + ic('shield', 'sm') + 'Akses Selamanya</span>';
    return '<article class="card pc hov">' + '<a href="#/produk/' + esc(p.id) + '" aria-label="' + esc(p.judul) + '">' + coverHTML(p) + '</a><div class="pc-b">' + (p.label ? '<div class="lbl">' + esc(p.label) + '</div>' : '') + '<a href="#/produk/' + esc(p.id) + '"><h4>' + esc(p.judul) + '</h4></a><p class="desc">' + esc(N.mdPlain(p.deskripsi, 170)) + '</p><div class="meta">' + meta + '</div><div class="pr">' + (disc ? '<s>' + rp(p.harga_coret) + '</s>' : '') + '<b>' + rp(p.harga) + '</b>' + (disc ? '<span class="pill or">Hemat ' + disc + '%</span>' : '') + '</div><div class="acts">' + (safeUrl(p.link_demo) ? '<a class="btn ghost sm" style="grid-column:1/-1" href="' + esc(safeUrl(p.link_demo)) + '" target="_blank" rel="noopener">' + ic('eye', 'sm') + 'Lihat Demo</a>' : '') + (own ? '<a class="btn nav" href="#/saya" style="grid-column:1/-1">' + ic('check', 'sm') + 'Sudah Dimiliki · Buka</a>' : pend ? '<a class="btn soft" href="#/saya/riwayat" style="grid-column:1/-1">' + ic('clock', 'sm') + 'Menunggu persetujuan</a>' : '<a class="btn pri" href="#/beli/' + esc(p.id) + '">' + ic('cart', 'sm') + 'Beli</a><a class="btn soft" href="#/redeem?p=' + esc(p.id) + '">' + ic('key', 'sm') + 'Kode Akses</a>') + '</div></div></article>';
  }
  function demoCard(d) {
    const img = safeUrl(d.cover_url), link = safeUrl(d.link_demo);
    return '<article class="card pc demo hov"><div class="cover">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">' : ic('globe', 'lg')) + '<span class="chip">' + ic('globe', 'sm') + esc(d.kategori || 'Demo') + '</span>' + (d.badge ? '<span class="pill or">' + esc(d.badge) + '</span>' : '') + '</div><div class="pc-b"><h4>' + esc(d.judul) + '</h4><p class="desc">' + esc(d.deskripsi) + '</p><div class="acts" style="grid-template-columns:1fr;margin-top:auto">' + (link ? '<a class="btn nav" href="' + esc(link) + '" target="_blank" rel="noopener">Buka Demo Interaktif ' + ic('ext', 'sm') + '</a>' : '<span class="btn soft" style="pointer-events:none">Segera hadir</span>') + '</div></div></article>';
  }
  function secHead(eyebrow, title, sub, right) { return '<div class="sec-h"><div><div class="eyebrow">' + esc(eyebrow) + '</div><h2 class="h2 mt" style="margin-top:6px">' + title + '</h2></div>' + (sub ? '<p class="muted">' + esc(sub) + '</p>' : '') + (right || '') + '</div>'; }
  const skel = n => Array.from({ length: n }, () => '<div class="card"><div class="sk" style="height:140px"></div><div class="sk" style="height:18px;margin-top:14px;width:70%"></div><div class="sk" style="height:14px;margin-top:10px"></div></div>').join('');

  /* ---------- BERANDA ---------- */
  function secLayanan(P) {
    const sv = P.services || [], web = sv.filter(s => s.kategori !== 'Aplikasi'), app = sv.filter(s => s.kategori === 'Aplikasi');
    const fit = s => String(s.fitur || '').split('|').filter(Boolean).map(f => '<li>' + ic('check') + esc(f) + '</li>').join('');
    return '<section class="sec" id="sec-layanan"><div class="wrap-c">' + secHead('Fitur utama', web.length + app.length + ' Layanan Unggulan Siap Pakai', 'Pilihan paket disesuaikan dengan skala usaha lokal di Nabire. Transparan, bergaransi, dan ramah pengguna pemula.') + '<div class="svc-grid">' +
      web.map(s => '<a class="card svc hov" href="#/jasa?l=' + encodeURIComponent(s.nama) + '"><div class="row between"><div class="ico">' + ic(svcIcon(s.nama)) + '</div><span class="price">Mulai ' + rp(s.harga_mulai) + '</span></div><h3>' + esc(s.nama) + '</h3><p class="small muted">' + esc(s.deskripsi) + '</p><ul>' + fit(s) + '</ul><span class="btn soft sm">Pilih Layanan ini</span></a>').join('') + '</div>' +
      app.map(s => '<div class="card svc svc-app"><div><div class="row wrap" style="gap:10px"><span class="pill" style="background:var(--orange);color:#fff">Rekomendasi UMKM</span><span class="price">Mulai ' + rp(s.harga_mulai) + '</span></div><h3>' + esc(s.nama) + '</h3><p class="small">' + esc(s.deskripsi) + '</p><a class="btn pri" href="#/jasa?l=' + encodeURIComponent(s.nama) + '">Pesan Aplikasi Web</a></div><ul>' + fit(s) + '</ul></div>').join('') + '</div></section>';
  }
  function marquee() {
    const it = [['cart', 'Website Toko Online'], ['server', 'Aplikasi Kasir / POS'], ['link', 'Link Bio Kustom'], ['video', 'Kelas Video Online'], ['key', 'Redeem Kode Akses'], ['shield', 'Transfer Bank & QRIS'], ['mail', 'Undangan Digital'], ['globe', 'Website UMKM'], ['file', 'Template & E-Book']], row = it.map(x => '<span>' + ic(x[0]) + x[1] + '</span>').join('');
    return '<div class="mq" aria-hidden="true"><div class="mq-t">' + row + row + '</div></div>';
  }
  function secDemo(P) {
    const d = P.demos || [];
    return '<section class="sec" id="sec-demo" style="background:#fff"><div class="wrap-c">' + secHead('Showcase portofolio', 'Galeri Karya Demo Nyata', 'Coba langsung demo website dan aplikasi yang sudah beroperasi di Nabire sebelum Anda memutuskan untuk memesan.') + (d.length ? '<div class="dc" data-n="' + d.length + '"><div class="dc-t" id="dc-t">' + d.map(x => '<div class="dc-s">' + demoCard(x) + '</div>').join('') + '</div>' + (d.length > 1 ? '<div class="dc-ctl"><button type="button" class="dc-n" data-act="dc-nav" data-d="-1" aria-label="Demo sebelumnya">' + ic('back', 'sm') + '</button><div class="dc-dots">' + d.map((x, i) => '<button type="button" class="' + (i ? '' : 'on') + '" data-act="dc-go" data-i="' + i + '" aria-label="Demo ' + (i + 1) + '"></button>').join('') + '</div><button type="button" class="dc-n" data-act="dc-nav" data-d="1" aria-label="Demo berikutnya">' + ic('arrow', 'sm') + '</button></div>' : '') + '</div>' : '<div class="card empty">' + ic('globe') + '<p>Karya demo akan segera ditampilkan.</p></div>') + '</div></section>';
  }
  function secKatalog(P) {
    const pr = (P.products || []).slice(0, 6);
    return '<section class="sec" id="sec-katalog"><div class="wrap-c">' + secHead('Katalog digital & kelas', 'Peralatan Digital Siap Unduh & Belajar', '', '<div class="row"><a class="btn soft sm" href="#/katalog">Lihat Semua Produk</a><a class="btn nav sm" href="#/redeem">' + ic('key', 'sm') + 'Redeem Kode</a></div>') + (pr.length ? '<div class="g3">' + pr.map(pcard).join('') + '</div>' : '<div class="card empty">' + ic('box') + '<p>Produk akan segera tersedia.</p></div>') + '</div></section>';
  }
  function secTesti(P) {
    const t = P.testimonials || []; if (!t.length) return '';
    return '<section class="sec" id="sec-testimoni" style="background:#fff"><div class="wrap-c center"><div class="eyebrow">Bukti kepuasan klien</div><h2 class="h2" style="margin:6px 0 24px">Apa Kata Pemilik Usaha di Nabire?</h2><div class="g3" style="text-align:left">' + t.map(x => '<div class="card quote"><div class="stars">' + '★'.repeat(Math.max(1, Math.min(5, Number(x.rating) || 5))) + '</div><p>“' + esc(x.isi) + '”</p><div class="row"><div class="avatar">' + (safeUrl(x.foto_url) ? '<img src="' + esc(safeUrl(x.foto_url)) + '" alt="" loading="lazy">' : esc(N.initials(x.nama))) + '</div><div><b>' + esc(x.nama) + '</b><div class="tiny muted">' + esc(x.jabatan) + '</div></div></div></div>').join('') + '</div></div></section>';
  }
  function secPesan(P, q) {
    const sv = P.services || [], me = S.session, pre = q.get('l') || SS.get('nk.svc') || '';
    return '<section class="sec" id="sec-pesan"><div class="wrap-c"><div class="card" style="padding:0;overflow:hidden"><div class="g2c" style="display:grid;gap:0;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))"><div style="padding:28px;background:linear-gradient(135deg,#eaf3ff,#fff)"><div class="eyebrow">Formulir pesanan cepat</div><h2 class="h2" style="margin:6px 0 10px">Siap Membawa Bisnis Anda Go Digital?</h2><p class="muted">Isi data kebutuhan Anda. Tim kami akan menghubungi untuk estimasi biaya dan konfirmasi lewat WhatsApp atau Gmail sesuai pilihan Anda.</p><div class="col mt2" style="gap:16px"><div class="row" style="align-items:flex-start"><span class="stepn">' + ic('clock') + '</span><div><b>Respons cepat</b><p class="small muted">Konsultasi awal gratis, tanpa kewajiban.</p></div></div><div class="row" style="align-items:flex-start"><span class="stepn o">' + ic('users') + '</span><div><b>Dukungan tatap muka di Nabire</b><p class="small muted">Bisa bertemu langsung untuk diskusi kebutuhan.</p></div></div><div class="row" style="align-items:flex-start"><span class="stepn">' + ic('shield') + '</span><div><b>Pengerjaan transparan</b><p class="small muted">Teknologi Google Sheets & Drive, tanpa langganan bulanan.</p></div></div></div></div>' +
      '<div style="padding:28px" id="req-box"><form data-form="request" novalidate><div class="grid2"><div class="fg"><label class="fl" for="r-nama">Nama Lengkap / Nama Usaha *</label><input class="in" id="r-nama" name="nama" required maxlength="80" autocomplete="name" value="' + esc(me ? me.nama : '') + '" placeholder="Contoh: Rubon Rumah Makan"></div><div class="fg"><label class="fl" for="r-email">Alamat Email</label><div class="ifld">' + N.ic('mail', 'sm') + '<input class="in" id="r-email" name="email" type="email" autocomplete="email" value="' + esc(me ? me.email : '') + '" placeholder="nama@gmail.com"></div></div></div><div class="grid2"><div class="fg"><label class="fl" for="r-wa">Nomor WhatsApp *</label><input class="in" id="r-wa" name="wa" inputmode="tel" required autocomplete="tel" placeholder="081234567890"></div><div class="fg"><label class="fl" for="r-l">Pilihan Layanan</label><select class="in" id="r-l" name="layanan">' + sv.map(s => '<option ' + (s.nama === pre ? 'selected' : '') + '>' + esc(s.nama) + '</option>').join('') + '<option>Lainnya / belum tahu</option></select></div></div><div class="fg"><label class="fl" for="r-d">Deskripsi Kebutuhan & Detail Usaha</label><textarea class="in" id="r-d" name="deskripsi" maxlength="1500" placeholder="Ceritakan jenis usaha, lokasi di Nabire, dan fitur khusus yang Anda inginkan."></textarea></div><div class="fg"><label class="fl">Kirim konfirmasi melalui</label><div class="row wrap"><label class="row card flat" style="padding:10px 14px;cursor:pointer"><input type="radio" name="preferensi" value="WhatsApp" checked> ' + ic('chat', 'sm') + ' WhatsApp Admin</label><label class="row card flat" style="padding:10px 14px;cursor:pointer"><input type="radio" name="preferensi" value="Gmail"> ' + ic('mail', 'sm') + ' Email (Gmail)</label></div></div><div class="err-t hide" id="r-err"></div><button class="btn pri block" type="submit">' + ic('send') + 'Kirim Permintaan Pemesanan Jasa</button></form></div></div></div></div></section>';
  }
  /* Ilustrasi hero ringan: PC dengan aplikasi web + HP dengan Link Bio, melayang (HTML/CSS murni, tanpa gambar) */
  function heroScene() {
    const bars = [38, 56, 44, 70, 52, 84, 66].map((h, i) => '<i style="--h:' + h + '%;--d:' + i + '"></i>').join('');
    return '<div class="hs" aria-hidden="true"><div class="hs-glow"></div>' +
      '<div class="hs-pc"><div class="hs-mon"><div class="hs-top"><i></i><i></i><i></i><span>nabirekreatif.com/#/admin</span></div><div class="hs-app"><div class="hs-side"><b></b><i class="on"></i><i></i><i></i><i></i><i></i></div><div class="hs-main"><div class="hs-h"><b>Dasbor Penjualan</b><span>Hari ini</span></div><div class="hs-kpi"><span><small>Pendapatan</small><em>Rp 5,6 jt</em></span><span><small>Pesanan</small><em>128</em></span><span class="o"><small>Member</small><em>+32</em></span></div><div class="hs-chart">' + bars + '</div><div class="hs-rows"><i></i><i></i><i></i></div></div></div></div><div class="hs-neck"></div><div class="hs-base"></div></div>' +
      '<div class="hs-ph"><div class="hs-scr"><div class="hs-cv"><svg viewBox="0 0 100 14" preserveAspectRatio="none"><path d="M0 8C16 2 30 2 48 8s34 7 52 0V14H0Z" fill="#FAF7F0"/></svg></div><div class="hs-av">NK</div><b class="hs-nm">Toko Kopi Nabire</b><small class="hs-ct">Nabire, Papua Tengah</small><i class="hs-pl"></i><i class="hs-pl"></i><i class="hs-pl o"></i><div class="hs-pr"><span><i></i><b>Kopi</b><em>35rb</em></span><span><i class="b"></i><b>Roti</b><em>20rb</em></span></div></div></div>' +
      '<div class="hs-b1"><span>' + ic('check', 'sm') + '</span><div><b>Pesanan baru</b><small>Rp 150.000 · QRIS</small></div></div>' +
      '<div class="hs-b2"><span>' + ic('link', 'sm') + '</span><div><b>Link Bio online</b><small>/#tokokopi</small></div></div></div>';
  }
  function homePage(anchor) {
    return {
      layout: 'pub', title: anchor === 'sec-pesan' ? 'Pesan Jasa Website' : '', anchor: anchor,
      render(m, q) {
        const P = N.usePub(), st = N.jsonSetting('hero_stat'), order = String(setting('beranda_bagian') || 'layanan,demo,katalog,testimoni,pesan').split(',').map(x => x.trim());
        const parts = { layanan: secLayanan, demo: secDemo, katalog: secKatalog, testimoni: secTesti, pesan: s => secPesan(s, q) };
        const hero = '<section class="hero"><div class="wrap-c hero-g"><div><span class="pill" style="background:#fff;box-shadow:var(--sh)"><span class="dot"></span>' + esc(setting('hero_badge')) + '</span><h1 class="h1" style="margin-top:16px"><span class="b">' + esc(setting('hero_judul')) + '</span> <span class="a">' + esc(setting('hero_judul_aksen')) + '</span></h1><p class="muted" style="margin-top:14px;font-size:16px;max-width:520px">' + esc(setting('hero_sub')) + '</p><div class="row wrap mt"><a class="btn pri" href="#/jasa">' + ic('send') + 'Pesan Jasa Website</a><a class="btn out" href="#/demo">' + ic('eye') + 'Lihat Demo Portofolio & Katalog</a></div><div class="hero-st">' + st.map(s => '<div><b>' + esc(s.n) + '</b><span>' + esc(s.l) + '</span></div>').join('') + '</div></div>' + heroScene() + '</div></section>';
        return hero + marquee() + order.filter(k => parts[k]).map(k => parts[k](P)).join('') + (order.indexOf('pesan') < 0 ? '' : '');
      },
      mount(root, m, q) { if (q.get('l')) SS.set('nk.svc', q.get('l')); dcStart(root); }
    };
  }
  /* Karosel demo: geser otomatis tiap 4,5 dtk; berhenti saat disentuh/diarahkan, saat tak terlihat, atau bila pengguna memilih kurangi gerak */
  const DC = { tm: 0, io: null, vis: false, hold: 0 };
  const dcT = () => N.$('#dc-t');
  function dcStep(t) { const s = t.querySelector('.dc-s'); return s ? s.getBoundingClientRect().width + (parseFloat(getComputedStyle(t).columnGap) || 0) : t.clientWidth; }
  function dcIdx(t) { return Math.round(t.scrollLeft / Math.max(1, dcStep(t))); }
  function dcMax(t) { return Math.max(0, Math.round((t.scrollWidth - t.clientWidth) / Math.max(1, dcStep(t)))); }
  function dcGo(i) { const t = dcT(); if (!t) return; const mx = dcMax(t); if (i > mx) i = 0; if (i < 0) i = mx; t.scrollTo({ left: i * dcStep(t), behavior: 'smooth' }); }
  function dcSync() { const t = dcT(); if (!t) return; const i = dcIdx(t); N.$$('.dc-dots button').forEach((b, k) => b.classList.toggle('on', k === i)); }
  function dcDots() { const t = dcT(); if (!t) return; const box = t.closest('.dc'), mx = dcMax(t), dots = box.querySelector('.dc-dots'), ctl = box.querySelector('.dc-ctl'); if (!dots) return; if (dots.children.length !== mx + 1) dots.innerHTML = Array.from({ length: mx + 1 }, (x, i) => '<button type="button" data-act="dc-go" data-i="' + i + '" aria-label="Geser ke ' + (i + 1) + '"></button>').join(''); ctl.classList.toggle('hide', mx === 0); dcSync(); }
  function dcStart(root) {
    clearInterval(DC.tm); if (DC.io) DC.io.disconnect(); const t = root.querySelector('#dc-t'); if (!t || t.children.length < 2) return;
    let raf = 0; t.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; dcSync(); }); }, { passive: true });
    dcDots(); if (!DC.rs) { DC.rs = 1; w.addEventListener('resize', N.debounce(dcDots, 200)); }
    const box = t.closest('.dc'), hold = () => { DC.hold = Date.now(); };
    ['pointerdown', 'touchstart', 'wheel', 'focusin', 'mouseenter'].forEach(e => box.addEventListener(e, hold, { passive: true }));
    box.addEventListener('mouseleave', () => { DC.hold = Date.now() - 4000; });
    if (w.matchMedia && w.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if ('IntersectionObserver' in w) { DC.io = new IntersectionObserver(es => { DC.vis = es[0].isIntersecting; }, { threshold: 0.35 }); DC.io.observe(t); } else DC.vis = true;
    DC.tm = setInterval(() => { const tt = dcT(); if (!tt) return clearInterval(DC.tm); if (!DC.vis || document.hidden || Date.now() - DC.hold < 7000) return; dcGo(dcIdx(tt) + 1); }, 4500);
  }
  ACT['dc-nav'] = el => { DC.hold = Date.now(); const t = dcT(); if (t) dcGo(dcIdx(t) + (+el.getAttribute('data-d'))); };
  ACT['dc-go'] = el => { DC.hold = Date.now(); dcGo(+el.getAttribute('data-i')); };
  route(/^\/$/, homePage(''));
  route(/^\/layanan$/, homePage('sec-layanan'));
  route(/^\/demo$/, homePage('sec-demo'));
  route(/^\/testimoni$/, homePage('sec-testimoni'));
  route(/^\/jasa$/, homePage('sec-pesan'));

  FORM.request = async (f) => {
    const btn = f.querySelector('button[type=submit]'), err = N.$('#r-err'), d = Object.fromEntries(new FormData(f).entries());
    err.classList.add('hide');
    if (!d.nama.trim()) { err.textContent = 'Nama wajib diisi.'; err.classList.remove('hide'); return; }
    if (!/^(\+?62|0)8\d{7,12}$/.test(String(d.wa).replace(/[\s-]/g, ''))) { err.textContent = 'Nomor WhatsApp tidak valid (contoh 081234567890).'; err.classList.remove('hide'); return; }
    if (d.preferensi === 'Gmail' && !d.email.trim()) { err.textContent = 'Isi email bila memilih konfirmasi lewat Gmail.'; err.classList.remove('hide'); return; }
    N.busy(btn, true); const r = await api('request.create', d); N.busy(btn, false);
    if (!r.success) { err.textContent = r.message; err.classList.remove('hide'); return; }
    const wa = r.data.wa_admin || setting('wa_admin'), text = 'Halo ' + N.appName() + ', saya ' + d.nama + '. Saya ingin memesan: ' + d.layanan + '.' + (d.deskripsi ? ' ' + d.deskripsi.slice(0, 300) : '');
    N.$('#req-box').innerHTML = '<div class="center" style="padding:24px 0"><div class="stepn" style="margin:0 auto 14px;width:56px;height:56px;border-radius:50%;background:var(--ok)">' + ic('check', 'lg') + '</div><h3 class="h2" style="font-size:22px">Permintaan terkirim!</h3><p class="muted mt">Tim kami akan menghubungi Anda lewat ' + (d.preferensi === 'Gmail' ? 'email' : 'WhatsApp') + ' sesegera mungkin.</p>' + (wa ? '<a class="btn wa mt" href="' + esc(N.waLink(wa, text)) + '" target="_blank" rel="noopener">' + ic('chat', 'sm') + 'Chat Admin Sekarang</a>' : '') + '<p class="mt"><a href="#/">Kembali ke beranda</a></p></div>';
    SS.del('nk.svc');
  };

  /* ---------- KATALOG ---------- */
  const CAT = { q: '' };
  function catList(P, tab) {
    let a = (P.products || []).slice(); if (tab) a = a.filter(p => p.tipe === tab);
    const q = CAT.q.trim().toLowerCase(); if (q) a = a.filter(p => (p.judul + ' ' + p.deskripsi + ' ' + p.label).toLowerCase().indexOf(q) > -1); return a;
  }
  function catalogPage(tab) {
    return {
      layout: 'pub', title: tab === 'kelas' ? 'Kelas Online' : 'Produk Digital',
      render(m, q) {
        const P = N.usePub(), all = P.products || [], nd = all.filter(p => p.tipe === 'digital').length, nk = all.filter(p => p.tipe === 'kelas').length, list = catList(P, tab);
        return '<section class="sec tight"><div class="wrap-c"><div class="row wrap between" style="align-items:flex-end;gap:20px"><div style="max-width:620px"><span class="pill">' + ic('box', 'sm') + 'Katalog resmi ' + esc(N.appName()) + '</span><h1 class="h1" style="margin-top:12px">Produk Digital Terkurasi & Kelas Praktis Nabire</h1><p class="muted mt" style="margin-top:10px;font-size:16px">Pilih aset siap pakai untuk akselerasi UMKM atau ikuti kurikulum video step-by-step. Akses lewat transfer bank lokal, QRIS, maupun penukaran kode.</p></div><div class="card" style="min-width:min(100%,340px)"><div class="row small bold" style="color:var(--navy)">' + ic('key', 'sm') + 'Punya Kode Akses?<span class="mono muted tiny" style="margin-left:auto">LYNK.ID / PROMO</span></div><form class="row mt" data-form="quick-redeem" style="margin-top:10px"><input class="in mono" name="kode" placeholder="NK-XXXX-XXXX" autocomplete="off" style="min-height:44px"><button class="btn nav" style="min-height:44px">Klaim</button></form><p class="tiny muted" style="margin-top:6px">Akses langsung ditautkan ke akun member Anda.</p></div></div>' +
          '<div class="row wrap between mt2" style="margin-top:28px"><div class="tabs"><a class="tab ' + (!tab ? 'on' : '') + '" href="#/katalog">' + ic('grid', 'sm') + 'Semua <em>' + all.length + '</em></a><a class="tab ' + (tab === 'digital' ? 'on' : '') + '" href="#/katalog/digital">' + ic('file', 'sm') + 'Produk Digital <em>' + nd + '</em></a><a class="tab ' + (tab === 'kelas' ? 'on' : '') + '" href="#/katalog/kelas">' + ic('video', 'sm') + 'Kelas Online <em>' + nk + '</em></a></div><div class="searchbox">' + ic('search', 'sm') + '<input class="in" data-input="cat-q" placeholder="Cari produk, kelas, atau kata kunci" value="' + esc(CAT.q) + '" aria-label="Cari"></div></div></div></section>' +
          '<section class="sec tight"><div class="wrap-c"><div class="g3" id="cat-grid">' + (all.length || N.hasEntry('pub', 'pub') ? (list.length ? list.map(pcard).join('') : '<div class="card empty" style="grid-column:1/-1">' + ic('search') + '<p>Tidak ada produk yang cocok.</p></div>') : skel(3)) + '</div></div></section>' +
          '<section class="sec cta-band"><div class="wrap-c center"><span class="pill">Standar transaksi aman</span><h2 class="h2" style="margin:10px 0 6px">Alur Pembelian 3 Langkah Sederhana</h2><p class="muted" style="max-width:560px;margin:0 auto 24px">Diverifikasi manual oleh pemilik. Kode akses otomatis dikirim ke Gmail Anda.</p><div class="steps3" style="text-align:left"><div class="card"><div class="row between"><span class="stepn">1</span><span class="eyebrow" style="color:var(--mute)">Langkah pertama</span></div><h4 class="h3 mt">Rincian Pesanan</h4><p class="small muted">Pilih produk atau kelas, cek harga, lalu masuk dengan akun member.</p></div><div class="card"><div class="row between"><span class="stepn o">2</span><span class="eyebrow">Langkah kedua</span></div><h4 class="h3 mt">Transfer Bank / QRIS</h4><p class="small muted">Bayar sesuai nominal ke rekening atau scan QRIS resmi.</p></div><div class="card"><div class="row between"><span class="stepn">3</span><span class="eyebrow" style="color:var(--mute)">Langkah ketiga</span></div><h4 class="h3 mt">Bukti & Akses Gmail</h4><p class="small muted">Unggah bukti bayar. Setelah disetujui, akses terbuka dan kode dikirim ke email.</p></div></div></div></section>';
      }
    };
  }
  route(/^\/katalog$/, catalogPage(''));
  route(/^\/katalog\/digital$/, catalogPage('digital'));
  route(/^\/katalog\/kelas$/, catalogPage('kelas'));
  INPUT['cat-q'] = el => {
    CAT.q = el.value; const g = N.$('#cat-grid'); if (!g) return;
    const P = N.pubData(), tab = /kelas$/.test(location.hash) ? 'kelas' : /digital$/.test(location.hash) ? 'digital' : '', list = catList(P, tab);
    g.innerHTML = list.length ? list.map(pcard).join('') : '<div class="card empty" style="grid-column:1/-1">' + ic('search') + '<p>Tidak ada produk yang cocok.</p></div>';
  };
  FORM['quick-redeem'] = f => { const kode = String(new FormData(f).get('kode') || '').trim(); if (!kode) return toast('Masukkan kode akses.', 'err'); if (!S.session) { SS.set('nk.code', kode); toast('Masuk dulu untuk mengklaim kode.'); return go('/masuk'); } SS.set('nk.code', kode); go('/saya/klaim'); };

  /* ---------- DETAIL PRODUK ---------- */
  route(/^\/produk\/([\w-]+)$/, {
    layout: 'pub', title: m => { const p = (N.pubData().products || []).find(x => x.id === m[1]); return p ? p.judul : 'Produk'; },
    render(m) {
      const P = N.usePub(), p = (P.products || []).find(x => x.id === m[1]);
      if (!p) return '<div class="wrap-c sec center">' + (N.hasEntry('pub', 'pub') ? '<h2 class="h2">Produk tidak ditemukan</h2><a class="btn pri mt" href="#/katalog">Ke Katalog</a>' : '<div class="sk" style="height:300px"></div>') + '</div>';
      const own = owned(p.id), pend = pending(p.id), disc = Number(p.harga_coret) > Number(p.harga) ? Math.round((1 - p.harga / p.harga_coret) * 100) : 0;
      const demo = safeUrl(p.link_demo), grup = own ? libGrup(p.id) : '';
      const kind = p.tipe === 'kelas' ? 'Kelas Video' : p.tipe_file === 'template' ? 'Template Web' : p.tipe_file === 'linkbio' ? 'Link Bio' : 'Produk Digital';
      const perks = [
        p.tipe_file === 'linkbio' ? ['link', 'Editor Link Bio mandiri', 'Atur sendiri dari HP'] : p.tipe === 'kelas' ? ['video', (p.modul || 0) + ' modul video', 'Belajar kapan saja'] : p.tipe_file === 'template' ? ['code', 'Template + kode lisensi', 'Unduh via Google Drive'] : p.tipe_file === 'pdf' ? ['eye', 'Baca PDF langsung', 'Tanpa aplikasi tambahan'] : ['download', 'Unduh via link', 'Langsung setelah disetujui'],
        ['shield', 'Akses selamanya', 'Sekali bayar'],
        p.punya_grup ? ['chat', 'Grup WhatsApp', 'Khusus pembeli'] : ['key', 'Redeem Kode Akses', 'Dari Lynk.id / admin']
      ].map(x => '<li><span class="pk-i">' + ic(x[0], 'sm') + '</span><div><b>' + esc(x[1]) + '</b><small>' + esc(x[2]) + '</small></div></li>').join('');
      const cta = own ? '<a class="btn nav block" href="#/saya/aset">' + ic('check', 'sm') + 'Sudah dimiliki — Buka</a>' + (grup ? '<a class="btn wa block" href="' + esc(grup) + '" target="_blank" rel="noopener">' + ic('whatsapp', 'sm') + 'Gabung Grup WhatsApp</a>' : '')
        : pend ? '<a class="btn soft block" href="#/saya/riwayat">' + ic('clock', 'sm') + 'Menunggu persetujuan admin</a>'
        : '<a class="btn pri block" id="pd-buy" href="#/beli/' + esc(p.id) + '">' + ic('cart', 'sm') + 'Beli Sekarang</a><a class="btn out block" href="#/redeem?p=' + esc(p.id) + '">' + ic('key', 'sm') + 'Punya Kode Akses</a>';
      const desc = String(p.deskripsi || '').trim();
      return '<section class="sec tight pd"><div class="wrap-c">' +
        '<nav class="crumb" aria-label="Navigasi"><a href="#/">Beranda</a>' + ic('arrow', 'sm') + '<a href="#/katalog">Katalog</a>' + ic('arrow', 'sm') + '<span>' + esc(kind) + '</span></nav>' +
        '<div class="pd-g"><div class="pd-media">' + gallery(p) + '</div>' +
        '<aside class="pd-buy card"><div class="row wrap" style="gap:6px"><span class="pill">' + esc(kind) + '</span>' + (p.badge ? '<span class="pill or">' + esc(p.badge) + '</span>' : '') + '</div>' +
        '<h1 class="pd-t">' + esc(p.judul) + '</h1>' + (p.label ? '<div class="pd-l">' + esc(p.label) + '</div>' : '') +
        '<div class="pd-p"><b>' + rp(p.harga) + '</b>' + (disc ? '<s>' + rp(p.harga_coret) + '</s><span class="pill or">Hemat ' + disc + '%</span>' : '') + '</div>' +
        '<div class="pd-cta">' + cta + (demo ? '<a class="btn soft block" href="' + esc(demo) + '" target="_blank" rel="noopener">' + ic('eye', 'sm') + 'Lihat Demo</a>' : '') + '</div>' +
        '<ul class="pd-pk">' + perks + '</ul></aside>' +
        (desc ? '<div class="pd-desc card"><div class="pd-dh"><h2>Deskripsi Produk</h2></div><div class="pd-dc" id="pd-dc">' + N.md(desc) + '</div><div class="pd-more hide" id="pd-more"><button type="button" class="btn soft" data-act="pd-more">' + ic('arrowdown', 'sm') + '<span>Baca selengkapnya</span></button></div></div>' : '') +
        '</div></div></section>' + (!own && !pend ? '<div class="pd-bar" id="pd-bar" aria-hidden="true"><div><small>' + esc(p.judul) + '</small><b>' + rp(p.harga) + '</b></div><a class="btn pri" href="#/beli/' + esc(p.id) + '" tabindex="-1">' + ic('cart', 'sm') + 'Beli</a></div>' : '');
    },
    mount(root) {
      const dc = root.querySelector('#pd-dc'), more = root.querySelector('#pd-more');
      if (dc && more) requestAnimationFrame(() => { if (dc.scrollHeight > 460) { dc.classList.add('clip'); more.classList.remove('hide'); } });
      const buy = root.querySelector('#pd-buy'), bar = root.querySelector('#pd-bar');
      if (buy && bar && 'IntersectionObserver' in w) { const io = new IntersectionObserver(es => { const off = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; bar.classList.toggle('on', off); bar.setAttribute('aria-hidden', String(!off)); }); io.observe(buy); }
    }
  });

  ACT['pd-more'] = el => { const dc = N.$('#pd-dc'); if (!dc) return; const open = dc.classList.toggle('open'); el.querySelector('span').textContent = open ? 'Tutup deskripsi' : 'Baca selengkapnya'; el.classList.toggle('up', open); if (!open) dc.closest('.pd-desc').scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  /* ---------- GALERI PRODUK: slider + lightbox ---------- */
  function libGrup(id) { const b = N.bootData(), x = b && b.library && b.library.find(q => q.id === id); return x ? safeUrl(x.grup_wa) : ''; }
  function gallery(p) {
    const a = imgsOf(p);
    if (a.length < 2) return a.length ? '<button type="button" class="gs-one" data-act="lb-open" data-i="0" aria-label="Perbesar foto">' + coverHTML(p) + '<span class="gs-zoom">' + ic('search', 'sm') + '</span></button>' : coverHTML(p);
    return '<div class="gs" data-n="' + a.length + '"><div class="gs-t" tabindex="0" aria-label="Galeri foto produk">' + a.map((u, i) => '<button type="button" class="gs-s" data-act="lb-open" data-i="' + i + '" aria-label="Perbesar foto ' + (i + 1) + '"><img src="' + esc(u) + '" alt="' + esc(p.judul) + ' — foto ' + (i + 1) + '" ' + (i ? 'loading="lazy" ' : 'fetchpriority="high" ') + 'decoding="async"></button>').join('') + '</div>' +
      '<button type="button" class="gs-nav l" data-act="gs-nav" data-d="-1" aria-label="Foto sebelumnya">' + ic('back', 'sm') + '</button><button type="button" class="gs-nav r" data-act="gs-nav" data-d="1" aria-label="Foto berikutnya">' + ic('arrow', 'sm') + '</button><span class="gs-c"><b>1</b>/' + a.length + '</span><span class="gs-zoom">' + ic('search', 'sm') + '</span></div>' +
      '<div class="gs-th">' + a.map((u, i) => '<button type="button" class="' + (i ? '' : 'on') + '" data-act="gs-go" data-i="' + i + '" aria-label="Foto ' + (i + 1) + '"><img src="' + esc(u) + '" alt="" loading="lazy" decoding="async"></button>').join('') + '</div>';
  }
  const GS = { imgs: [], i: 0 };
  function gsIdx(t) { return Math.round(t.scrollLeft / Math.max(1, t.clientWidth)); }
  function gsSync(t) { const i = gsIdx(t), box = t.closest('.gs'), c = box && box.querySelector('.gs-c b'); if (c) c.textContent = i + 1; N.$$('.gs-th button').forEach((b, k) => b.classList.toggle('on', k === i)); const th = N.$$('.gs-th button')[i]; if (th && th.scrollIntoView && th.parentElement.scrollWidth > th.parentElement.clientWidth) th.parentElement.scrollTo({ left: th.offsetLeft - 40, behavior: 'smooth' }); }
  function gsTo(i) { const t = N.$('.gs-t'); if (t) t.scrollTo({ left: i * t.clientWidth, behavior: 'smooth' }); }
  ACT['gs-nav'] = el => { const t = N.$('.gs-t'); if (!t) return; const n = t.children.length; gsTo((gsIdx(t) + (+el.getAttribute('data-d')) + n) % n); };
  ACT['gs-go'] = el => gsTo(+el.getAttribute('data-i'));
  ACT['lb-open'] = el => { const id = (location.hash.match(/produk\/([\w-]+)/) || [])[1], p = (N.pubData().products || []).find(x => x.id === id); if (!p) return; GS.imgs = imgsOf(p); GS.i = +el.getAttribute('data-i') || 0; lbShow(p.judul); };
  function lbShow(title) {
    let lb = N.$('#lb'); if (lb) lb.remove();
    lb = document.createElement('div'); lb.id = 'lb'; lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Foto ' + title);
    lb.innerHTML = '<div class="lb-top"><span class="lb-c"><b>' + (GS.i + 1) + '</b>/' + GS.imgs.length + '</span><span class="lb-tt">' + esc(title) + '</span><button type="button" class="lb-x" data-act="lb-x" aria-label="Tutup">' + ic('x') + '</button></div><div class="lb-t">' + GS.imgs.map(u => '<div class="lb-s"><img src="' + esc(u) + '" alt="" decoding="async"></div>').join('') + '</div>' + (GS.imgs.length > 1 ? '<button type="button" class="lb-n l" data-act="lb-nav" data-d="-1" aria-label="Sebelumnya">' + ic('back') + '</button><button type="button" class="lb-n r" data-act="lb-nav" data-d="1" aria-label="Berikutnya">' + ic('arrow') + '</button>' : '');
    document.body.appendChild(lb); document.body.classList.add('lb-on');
    const t = lb.querySelector('.lb-t'); requestAnimationFrame(() => { t.scrollLeft = GS.i * t.clientWidth; lb.classList.add('on'); });
    t.addEventListener('scroll', () => { const i = Math.round(t.scrollLeft / Math.max(1, t.clientWidth)); if (i !== GS.i) { GS.i = i; lb.querySelector('.lb-c b').textContent = i + 1; } }, { passive: true });
    t.addEventListener('click', e => { if (e.target === t || e.target.classList.contains('lb-s')) lbClose(); });
  }
  function lbClose() { const lb = N.$('#lb'); if (lb) lb.remove(); document.body.classList.remove('lb-on'); }
  ACT['lb-x'] = lbClose;
  ACT['lb-nav'] = el => { const t = N.$('#lb .lb-t'); if (!t) return; const n = GS.imgs.length; GS.i = (GS.i + (+el.getAttribute('data-d')) + n) % n; t.scrollTo({ left: GS.i * t.clientWidth, behavior: 'smooth' }); };
  document.addEventListener('keydown', e => { if (!N.$('#lb')) return; if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') ACT['lb-nav']({ getAttribute: () => (e.key === 'ArrowRight' ? '1' : '-1') }); });
  window.addEventListener('hashchange', lbClose);
  let gsRaf = 0; document.addEventListener('scroll', e => { const t = e.target; if (!t || !t.classList || !t.classList.contains('gs-t') || gsRaf) return; gsRaf = requestAnimationFrame(() => { gsRaf = 0; gsSync(t); }); }, true);

  /* ---------- REDEEM (publik) ---------- */
  route(/^\/redeem$/, {
    layout: 'pub', title: 'Redeem Kode Akses',
    render(m, q) {
      if (S.session) { return '<div class="wrap-c sec center"><div class="sk" style="height:120px"></div></div>'; }
      const p = (N.pubData().products || []).find(x => x.id === q.get('p'));
      return '<div class="authw"><div class="auth card"><div class="center"><div class="stepn o" style="margin:0 auto 12px;width:52px;height:52px;border-radius:14px">' + ic('key', 'lg') + '</div><h1 class="h2" style="font-size:24px">Redeem Kode Akses</h1><p class="muted small mt" style="margin-top:6px">Masukkan kode yang Anda terima setelah membeli di Lynk.id' + (p ? ' untuk <b>' + esc(p.judul) + '</b>' : '') + '. 1 kode = 1 produk, sekali pakai.</p></div><form data-form="quick-redeem" class="mt"><div class="fg"><label class="fl" for="rd-k">Kode Akses</label><input class="in mono" id="rd-k" name="kode" placeholder="NK-XXXX-XXXX" autocomplete="off" autocapitalize="characters" value="' + esc(String(q.get('kode') || '').slice(0, 40)) + '"></div><button class="btn pri block">' + ic('zap', 'sm') + 'Lanjut — Masuk & Klaim</button></form><p class="tiny muted center mt">Anda perlu akun member (gratis). Akses ditautkan ke akun Anda.</p></div></div>';
    },
    mount(root, m, q) { const k = String(q.get('kode') || '').trim(); if (S.session) { if (k) SS.set('nk.code', k); go('/saya/klaim', true); } }
  });

  /* ---------- AUTH ---------- */
  function afterAuth(data) {
    N.applySession(data); const code = SS.get('nk.code'), next = SS.get('nk.next'); SS.del('nk.next');
    if (code && data.role !== 'superadmin') return go('/saya/klaim', true);
    if (next && next !== '/masuk' && next !== '/daftar') return go(next, true);
    go(data.role === 'superadmin' ? '/admin' : '/saya', true);
  }
  const eye = N.pwEye;
  function authShell(title, sub, body, foot, google) {
    return '<div class="authw"><div class="auth card"><div class="center"><img src="' + esc(N.setting('logo_url') || N.asset('assets/logo-icon.png')) + '" alt="" width="56" height="56" style="margin:0 auto 10px;border-radius:14px"><h1 class="h2" style="font-size:24px">' + title + '</h1><p class="muted small" style="margin-top:4px">' + sub + '</p></div><div class="mt">' + body + '</div>' + (google && (setting('google_client_id') || (w.NK_CONFIG || {}).GOOGLE_CLIENT_ID) ? '<div class="divider">atau</div><div id="g-btn"></div>' : '') + '<p class="small center muted mt">' + foot + '</p></div></div>';
  }
  const gMount = () => N.mountGoogle(N.$('#g-btn'), async cred => { const r = await api('auth.google', { credential: cred }); if (!r.success) return toast(r.message, 'err'); afterAuth(r.data); });
  route(/^\/masuk$/, {
    layout: 'pub', title: 'Masuk',
    render() { if (S.session) return ''; return authShell('Masuk ke Area Member', 'Akses produk, kelas, dan riwayat pesanan Anda.', '<form data-form="login" novalidate><div class="fg"><label class="fl" for="l-e">Email</label><div class="ifld">' + N.ic('mail', 'sm') + '<input class="in" id="l-e" name="email" type="email" autocomplete="username" required placeholder="nama@gmail.com"></div></div><div class="fg"><label class="fl" for="l-p">Kata sandi</label><div class="ifld pw">' + N.ic('lock', 'sm') + '<input class="in" id="l-p" name="password" type="password" autocomplete="current-password" required placeholder="Kata sandi Anda">' + eye + '</div></div><div class="err-t hide" id="a-err"></div><button class="btn pri block mt" type="submit">Masuk</button><p class="small center" style="margin-top:12px"><a href="#/lupa" style="color:var(--navy);font-weight:700">Lupa kata sandi?</a></p></form>', 'Belum punya akun? <a href="#/daftar" style="color:var(--navy);font-weight:700">Daftar gratis</a>', true); },
    mount() { if (S.session) return go(S.session.role === 'superadmin' ? '/admin' : '/saya', true); gMount(); }
  });
  route(/^\/daftar$/, {
    layout: 'pub', title: 'Daftar',
    render() { if (S.session) return ''; return authShell('Buat Akun Member', 'Gratis. Dibutuhkan untuk membeli dan mengakses produk.', '<form data-form="register" novalidate><div class="fg"><label class="fl" for="g-n">Nama lengkap</label><input class="in" id="g-n" name="nama" autocomplete="name" required maxlength="80"></div><div class="fg"><label class="fl" for="g-e">Email (Gmail)</label><div class="ifld">' + N.ic('mail', 'sm') + '<input class="in" id="g-e" name="email" type="email" autocomplete="email" required placeholder="nama@gmail.com"></div><p class="hint">Kode & link akses dikirim ke email ini.</p></div><div class="fg"><label class="fl" for="g-w">Nomor WhatsApp <span class="muted" style="font-weight:500">(opsional)</span></label><input class="in" id="g-w" name="wa" inputmode="tel" autocomplete="tel" placeholder="081234567890"></div><div class="fg"><label class="fl" for="g-p">Kata sandi</label><div class="ifld pw">' + N.ic('lock', 'sm') + '<input class="in" id="g-p" name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="Minimal 8 karakter">' + eye + '</div></div><div class="err-t hide" id="a-err"></div><button class="btn pri block mt" type="submit">Daftar & Masuk</button></form>', 'Sudah punya akun? <a href="#/masuk" style="color:var(--navy);font-weight:700">Masuk</a>', true); },
    mount() { if (S.session) return go('/saya', true); gMount(); }
  });
  const FG = { step: 1, email: '' };
  route(/^\/lupa$/, {
    layout: 'pub', title: 'Lupa kata sandi',
    render() { return FG.step === 1 ? authShell('Lupa Kata Sandi', 'Kami kirim kode 6 digit ke email Anda.', '<form data-form="forgot" novalidate><div class="fg"><label class="fl" for="f-e">Email terdaftar</label><div class="ifld">' + N.ic('mail', 'sm') + '<input class="in" id="f-e" name="email" type="email" required value="' + esc(FG.email) + '" placeholder="nama@gmail.com"></div></div><div class="err-t hide" id="a-err"></div><button class="btn pri block" type="submit">Kirim Kode</button></form>', '<a href="#/masuk" style="color:var(--navy);font-weight:700">Kembali ke Masuk</a>') : authShell('Atur Ulang Kata Sandi', 'Kode dikirim ke <b>' + esc(FG.email) + '</b>. Berlaku 15 menit.', '<form data-form="reset" novalidate><div class="fg"><label class="fl" for="f-k">Kode 6 digit</label><input class="in mono" id="f-k" name="kode" inputmode="numeric" maxlength="6" required autocomplete="one-time-code"></div><div class="fg"><label class="fl" for="f-p">Kata sandi baru</label><div class="ifld pw">' + N.ic('lock', 'sm') + '<input class="in" id="f-p" name="password" type="password" minlength="8" required autocomplete="new-password" placeholder="Minimal 8 karakter">' + eye + '</div></div><div class="err-t hide" id="a-err"></div><button class="btn pri block" type="submit">Simpan Kata Sandi</button></form>', '<a href="#/lupa" data-act="fg-back" style="color:var(--navy);font-weight:700">Kirim ulang kode</a>');
    }
  });
  ACT['fg-back'] = () => { FG.step = 1; N.renderRoute(true); };
  const showErr = (m) => { const e = N.$('#a-err'); if (e) { e.textContent = m; e.classList.remove('hide'); } };
  FORM.login = async f => { const d = Object.fromEntries(new FormData(f).entries()), b = f.querySelector('button[type=submit]'); N.$('#a-err').classList.add('hide'); if (!d.email || !d.password) return showErr('Isi email dan kata sandi.'); N.busy(b, true); const r = await api('auth.login', d); N.busy(b, false); if (!r.success) return showErr(r.message); afterAuth(r.data); };
  FORM.register = async f => { const d = Object.fromEntries(new FormData(f).entries()), b = f.querySelector('button[type=submit]'); N.$('#a-err').classList.add('hide'); if (d.password.length < 8) return showErr('Kata sandi minimal 8 karakter.'); N.busy(b, true); const r = await api('auth.register', d); N.busy(b, false); if (!r.success) return showErr(r.message); toast(r.message || 'Akun dibuat', 'ok'); afterAuth(r.data); };
  FORM.forgot = async f => { const d = Object.fromEntries(new FormData(f).entries()), b = f.querySelector('button[type=submit]'); N.$('#a-err').classList.add('hide'); N.busy(b, true); const r = await api('auth.forgot', d); N.busy(b, false); if (!r.success) return showErr(r.message); FG.email = d.email.trim().toLowerCase(); FG.step = 2; toast(r.message, 'ok', 5000); N.renderRoute(true); };
  FORM.reset = async f => { const d = Object.fromEntries(new FormData(f).entries()), b = f.querySelector('button[type=submit]'); d.email = FG.email; N.$('#a-err').classList.add('hide'); N.busy(b, true); const r = await api('auth.reset', d); N.busy(b, false); if (!r.success) return showErr(r.message); FG.step = 1; toast(r.message, 'ok'); go('/masuk'); };

  /* ---------- CHECKOUT ---------- */
  const CO = { id: '', step: 1, metode: 'transfer', file: null, done: null, busy: false };
  function stepper(s) { return '<div class="stp">' + ['Rincian', 'Pembayaran', 'Bukti'].map((t, i) => '<div class="' + (s === i + 1 ? 'on' : s > i + 1 ? 'dn' : '') + '">' + (i + 1) + '. ' + t + '</div>').join('') + '</div>'; }
  route(/^\/beli\/([\w-]+)$/, {
    layout: 'pub', title: 'Pembelian', auth: 'member',
    render(m) {
      const P = N.usePub(); if (CO.id !== m[1]) { CO.id = m[1]; CO.step = 1; CO.metode = 'transfer'; CO.file = null; CO.done = null; }
      const p = (P.products || []).find(x => x.id === m[1]);
      if (!p) return '<div class="wrap-c sec center">' + (N.hasEntry('pub', 'pub') ? '<h2 class="h2">Produk tidak ditemukan</h2><a class="btn pri mt" href="#/katalog">Ke Katalog</a>' : '<div class="sk" style="height:260px"></div>') + '</div>';
      const me = S.session, own = owned(p.id), pend = pending(p.id), rek = N.jsonSetting('rekening'), qris = safeUrl(setting('qris_url')), ext = safeUrl(p.link_bayar);
      const summary = '<div class="card" style="position:sticky;top:76px"><h3 style="font-size:16px">Ringkasan Pesanan</h3><div class="row mt" style="margin-top:12px;align-items:flex-start"><div style="width:84px;flex:none">' + coverHTML(p, p.tipe === 'kelas' ? 'Kelas' : 'Digital').replace('class="chip"', 'class="chip hide"') + '</div><div><b>' + esc(p.judul) + '</b><div class="tiny muted">' + (p.tipe === 'kelas' ? 'Kelas Video' : 'Produk Digital') + '</div></div></div><div style="margin-top:12px"><div class="sumrow"><span>Harga</span><span>' + rp(p.harga) + '</span></div>' + (Number(p.harga_coret) > Number(p.harga) ? '<div class="sumrow"><span>Diskon</span><span style="color:var(--ok)">− ' + rp(p.harga_coret - p.harga) + '</span></div>' : '') + '<div class="sumrow tot"><span>Total Bayar</span><span>' + rp(p.harga) + '</span></div></div><p class="tiny muted">Kode & link akses dikirim ke <b>' + esc(me.email) + '</b> setelah pembayaran disetujui.</p></div>';
      let main;
      if (CO.done) main = '<div class="card center" style="padding:32px"><div class="stepn" style="margin:0 auto 14px;width:60px;height:60px;border-radius:50%;background:var(--ok)">' + ic('check', 'lg') + '</div><h2 class="h2" style="font-size:22px">Bukti pembayaran terkirim</h2><p class="muted mt">Nomor pesanan <b class="mono">' + esc(CO.done.kode_order) + '</b>. Admin akan memverifikasi, lalu akses terbuka otomatis dan kode dikirim ke Gmail Anda.</p><div class="row wrap mt" style="justify-content:center"><a class="btn pri" href="#/saya/riwayat">Lihat Riwayat Pesanan</a><a class="btn soft" href="#/katalog">Lanjut Belanja</a></div></div>';
      else if (own) main = '<div class="card center"><h3>Anda sudah memiliki produk ini</h3><a class="btn nav mt" href="#/saya">Buka di Area Member</a></div>';
      else if (pend) main = '<div class="card center"><div class="alert info" style="text-align:left">' + ic('clock') + '<span>Pesanan produk ini sedang menunggu persetujuan admin. Anda akan menerima email saat disetujui.</span></div><a class="btn soft mt" href="#/saya/riwayat">Lihat Riwayat</a></div>';
      else if (CO.step === 1) main = '<div class="card">' + stepper(1) + '<h3>Rincian Pesanan</h3><p class="muted small mt" style="margin-top:6px">' + esc(N.mdPlain(p.deskripsi, 220)) + '</p><dl class="kv mt"><dt>Produk</dt><dd><b>' + esc(p.judul) + '</b></dd><dt>Akun pembeli</dt><dd>' + esc(me.nama) + ' · ' + esc(me.email) + '</dd><dt>Pengiriman</dt><dd>Kode & link akses lewat Gmail</dd></dl><button class="btn pri block mt2" data-act="co-next" style="margin-top:22px">Lanjut ke Pembayaran ' + ic('arrow', 'sm') + '</button>' + (own ? '' : '<p class="small center muted" style="margin-top:12px">Sudah punya kode dari Lynk.id? <a href="#/saya/klaim" style="color:var(--navy);font-weight:700">Redeem di sini</a></p>') + '</div>';
      else if (CO.step === 2) main = '<div class="card">' + stepper(2) + '<h3>Pembayaran</h3><div class="seg mt" style="margin-top:12px">' + '<button class="' + (CO.metode === 'transfer' ? 'on' : '') + '" data-act="co-metode" data-v="transfer">Transfer Bank</button>' + (qris ? '<button class="' + (CO.metode === 'qris' ? 'on' : '') + '" data-act="co-metode" data-v="qris">QRIS</button>' : '') + '</div>' +
        (CO.metode === 'qris' && qris ? '<div class="mt center"><div class="qris"><img src="' + esc(qris) + '" alt="QRIS"></div><p class="small muted mt">Scan dengan e-wallet / m-banking. Nominal: <b>' + rp(p.harga) + '</b></p></div>' : '<div class="col mt" style="margin-top:14px">' + (rek.length ? rek.map(r => '<div class="rek"><div><div class="tiny muted">' + esc(r.bank) + ' · a.n. ' + esc(r.nama) + '</div><b>' + esc(r.no) + '</b></div><button class="btn soft xs" data-act="copy" data-v="' + esc(r.no) + '">' + ic('copy', 'sm') + 'Salin</button></div>').join('') : '<div class="alert">' + ic('alert') + '<span>Rekening belum diatur admin. Hubungi admin via WhatsApp.</span></div>') + '</div>') +
        '<div class="alert info mt" style="margin-top:14px">' + ic('info') + '<span>' + esc(setting('info_bayar')) + '</span></div>' + (ext ? '<a class="btn out block mt" style="margin-top:14px" href="' + esc(ext) + '" target="_blank" rel="noopener">' + ic('ext', 'sm') + 'Bayar lewat link pembayaran luar</a><p class="tiny muted center" style="margin-top:6px">Setelah membayar di link luar, Anda akan menerima kode akses dan bisa menukarnya di menu Redeem.</p>' : '') + '<div class="row mt2" style="margin-top:20px"><button class="btn ghost" data-act="co-prev">' + ic('back', 'sm') + 'Kembali</button><button class="btn pri grow" data-act="co-next">Saya Sudah Membayar — Unggah Bukti</button></div></div>';
      else main = '<div class="card">' + stepper(3) + '<h3>Unggah Bukti Pembayaran</h3><p class="small muted mt" style="margin-top:6px">Foto struk transfer / tangkapan layar QRIS. Format JPG, PNG, WEBP, atau PDF (maks ±3 MB). Foto otomatis diperkecil.</p><label class="drop mt" id="drop" style="display:block;margin-top:14px">' + (CO.file ? (CO.file.preview ? '<img src="' + CO.file.preview + '" alt="Pratinjau bukti">' : '<div class="stepn" style="margin:0 auto 8px">' + ic('file') + '</div>') + '<div class="small bold">' + esc(CO.file.name) + '</div><div class="tiny muted">Ketuk untuk mengganti</div>' : '<div style="color:var(--navy)">' + ic('upload', 'lg') + '</div><b>Pilih atau seret berkas bukti</b><div class="tiny muted">Ketuk untuk membuka galeri / kamera</div>') + '<input type="file" id="co-file" data-change="co-file" accept="image/*,application/pdf" style="display:none"></label><div class="err-t hide" id="co-err"></div><div class="row mt2" style="margin-top:20px"><button class="btn ghost" data-act="co-prev">' + ic('back', 'sm') + 'Kembali</button><button class="btn pri grow" data-act="co-send" ' + (CO.file ? '' : 'disabled') + '>' + ic('send', 'sm') + 'Kirim Bukti Pembayaran</button></div></div>';
      return '<section class="sec tight"><div class="wrap-c"><a class="btn ghost sm" href="#/produk/' + esc(p.id) + '">' + ic('back', 'sm') + 'Kembali ke produk</a><div class="cx" style="margin-top:10px"><div>' + main + '</div>' + summary + '</div></div></section>';
    },
    mount() {
      const d = N.$('#drop'); if (!d) return;
      ['dragover', 'dragenter'].forEach(ev => d.addEventListener(ev, e => { e.preventDefault(); d.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(ev => d.addEventListener(ev, e => { e.preventDefault(); d.classList.remove('over'); }));
      d.addEventListener('drop', e => { if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]); });
    }
  });
  async function pickFile(file) { try { CO.file = await N.readFile(file, 1600, 0.82); N.renderRoute(true); } catch (e) { toast(e.message, 'err'); } }
  INPUT['co-file'] = el => { if (el.files[0]) pickFile(el.files[0]); };
  ACT['co-next'] = () => { CO.step = Math.min(3, CO.step + 1); N.renderRoute(false); };
  ACT['co-prev'] = () => { CO.step = Math.max(1, CO.step - 1); N.renderRoute(false); };
  ACT['co-metode'] = el => { CO.metode = el.getAttribute('data-v'); N.renderRoute(true); };
  ACT['co-send'] = async el => {
    if (!CO.file || CO.busy) return; CO.busy = true; N.busy(el, true);
    const r = await api('order.create', { productId: CO.id, metode: CO.metode, bukti: { name: CO.file.name, mime: CO.file.mime, data: CO.file.data } });
    CO.busy = false; N.busy(el, false);
    if (!r.success) { const e = N.$('#co-err'); if (e) { e.textContent = r.message; e.classList.remove('hide'); } return toast(r.message, 'err'); }
    N.sset('u', 'boot', r.data.boot); CO.done = r.data.order; CO.file = null; toast(r.message, 'ok'); N.renderRoute(false);
  };

  w.NKP = { pcard, coverHTML, owned, pending, afterAuth, SS };
})(window);
