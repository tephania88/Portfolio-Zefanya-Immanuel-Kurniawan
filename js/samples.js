// Simulasi contoh BUATAN SENDIRI dengan konten umum (bukan materi perusahaan).
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // ---------- Modal ----------
  const modal = document.createElement('div');
  modal.className = 'sim'; modal.hidden = true;
  modal.innerHTML = `<div class="sim-box" role="dialog" aria-modal="true">
    <button class="sim-close" aria-label="Tutup">✕</button>
    <h3 class="sim-title"></h3><p class="sim-note"></p>
    <div class="sim-tabs"></div><div class="sim-body"></div></div>`;
  document.body.appendChild(modal);
  const box = $('.sim-box', modal), body = $('.sim-body', modal), tabs = $('.sim-tabs', modal);
  const close = () => { modal.hidden = true; body.innerHTML = ''; document.body.style.overflow = ''; };
  $('.sim-close', modal).addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (!modal.hidden && e.key === 'Escape') close(); });

  function open(title, note, defs) {
    $('.sim-title', modal).textContent = title;
    $('.sim-note', modal).textContent = note;
    tabs.innerHTML = defs.map((d, i) => `<button data-t="${i}">${d.name}</button>`).join('');
    const show = i => {
      $$('button', tabs).forEach((b, k) => b.classList.toggle('on', k === i));
      body.innerHTML = ''; const host = document.createElement('div'); body.appendChild(host); defs[i].build(host);
      if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches)
        gsap.from(host, { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' });
    };
    tabs.onclick = e => { const b = e.target.closest('button'); if (b) show(+b.dataset.t); };
    modal.hidden = false; document.body.style.overflow = 'hidden'; show(0);
    if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches)
      gsap.fromTo(box, { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' });
  }

  // ---------- 1) Balanced Scorecard: klik berurutan ----------
  function buildBSC(host) {
    const P = [
      ['Financial', '“Bagaimana kita terlihat di mata pemegang saham?”', 'top'],
      ['Customer', '“Bagaimana pelanggan melihat kita?”', 'left'],
      ['Internal Process', '“Proses apa yang harus unggul?”', 'right'],
      ['Learning & Growth', '“Bagaimana kita terus berkembang dan menciptakan nilai?”', 'bottom']
    ];
    let done = 0;
    host.innerHTML = `<p class="sim-hint">Mulai dari perspektif 1, perspektif berikutnya terbuka setelah setiap klik.</p>
      <div class="bsc"><div class="bsc-core">Visi &amp;<br>Strategi</div>
      ${P.map((p, i) => `<button class="bsc-node ${p[2]}" data-i="${i}" ${i ? 'disabled' : ''}><small>PERSPEKTIF 0${i + 1}</small>${p[0]}</button>`).join('')}
      <div class="bsc-panel"><small>Cara menjelajah</small><p>Setiap perspektif berawal dari Visi &amp; Strategi. Klik <b>Perspektif 01</b> untuk mulai.</p></div></div>
      <p class="sim-done" hidden>✓ Semua perspektif selaras dengan visi dan strategi.</p>`;
    const nodes = $$('.bsc-node', host), panel = $('.bsc-panel', host);
    nodes[0].classList.add('pulse');
    nodes.forEach((n, i) => n.addEventListener('click', () => {
      n.classList.remove('pulse'); n.classList.add('seen');
      panel.innerHTML = `<small>PERSPEKTIF 0${i + 1} / 04</small><h4>${P[i][0]}</h4><p>${P[i][1]}</p>`;
      if (window.gsap) gsap.from(panel, { x: 16, opacity: 0, duration: 0.35 });
      if (i === done) {
        done++;
        if (nodes[done]) { nodes[done].disabled = false; nodes[done].classList.add('pulse'); }
        else $('.sim-done', host).hidden = false;
      }
    }));
  }

  // ---------- 2) Drag & drop: proses rekrutmen ----------
  function buildDnD(host) {
    const S = ['Permintaan', 'Sourcing', 'Seleksi', 'Penerimaan', 'Onboarding'];
    const A = [
      ['Menyetujui kebutuhan posisi', 0], ['Memasang lowongan', 1], ['Menyaring CV', 1], ['Wawancara kandidat', 2],
      ['Tes kompetensi', 2], ['Mengirim penawaran kerja', 3], ['Orientasi hari pertama', 4], ['Menyiapkan fasilitas kerja', 4]
    ];
    let ok = 0, sel = null;
    host.innerHTML = `<p class="sim-hint">Seret setiap kartu ke tahap yang tepat (atau ketuk kartu, lalu ketuk tahapnya).</p>
      <div class="dnd-stages">${S.map((s, i) => `<div class="dnd-stage" data-s="${i}"><b>0${i + 1} ${s}</b><div class="dnd-drop"></div></div>`).join('')}</div>
      <div class="dnd-pool">${A.map((a, i) => `<div class="dnd-chip" draggable="true" data-s="${a[1]}" data-i="${i}">${a[0]}</div>`).join('')}</div>
      <p class="dnd-msg" aria-live="polite">0 / ${A.length} tepat</p><button class="sim-reset">Ulangi</button>`;
    const msg = $('.dnd-msg', host);
    const place = (chip, stage) => {
      if (+chip.dataset.s === +stage.dataset.s) {
        $('.dnd-drop', stage).appendChild(chip); chip.draggable = false; chip.classList.add('ok'); chip.classList.remove('sel'); sel = null; ok++;
        msg.textContent = ok === A.length ? '🎉 Semua tahap tepat! Proses rekrutmen tersusun.' : `${ok} / ${A.length} tepat`;
        if (window.gsap) gsap.from(chip, { scale: 0.8, duration: 0.35, ease: 'back.out(2)' });
      } else {
        stage.classList.add('shake'); setTimeout(() => stage.classList.remove('shake'), 400);
        msg.textContent = 'Belum tepat, coba tahap lain.';
      }
    };
    $$('.dnd-chip', host).forEach(c => {
      c.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', c.dataset.i); c.classList.add('drag'); });
      c.addEventListener('dragend', () => c.classList.remove('drag'));
      c.addEventListener('click', () => { if (c.classList.contains('ok')) return; $$('.dnd-chip', host).forEach(x => x.classList.remove('sel')); c.classList.add('sel'); sel = c; });
    });
    $$('.dnd-stage', host).forEach(st => {
      st.addEventListener('dragover', e => { e.preventDefault(); st.classList.add('over'); });
      st.addEventListener('dragleave', () => st.classList.remove('over'));
      st.addEventListener('drop', e => {
        e.preventDefault(); st.classList.remove('over');
        const c = $(`.dnd-chip[data-i="${e.dataTransfer.getData('text/plain')}"]`, host); if (c) place(c, st);
      });
      st.addEventListener('click', () => { if (sel) place(sel, st); });
    });
    $('.sim-reset', host).addEventListener('click', () => buildDnD(host));
  }

  // ---------- 3) Sebelum / sesudah redesain slide ----------
  function buildBA(host) {
    host.innerHTML = `<p class="sim-hint">Geser untuk membandingkan slide sebelum dan sesudah redesain (contoh umum buatan sendiri).</p>
      <div class="ba"><div class="ba-slide ba-after"><h4>3 Kunci Komunikasi Efektif</h4>
        <div class="ba-cards"><div><span>🎯</span><b>Jelas</b><small>Satu pesan utama per slide</small></div>
        <div><span>👂</span><b>Mendengar</b><small>Beri ruang bertanya</small></div>
        <div><span>🤝</span><b>Empati</b><small>Pahami sudut pandang lawan bicara</small></div></div></div>
        <div class="ba-slide ba-before" id="baBefore"><h4>Komunikasi Efektif</h4>
        <ul><li>Komunikasi adalah proses penyampaian pesan dari komunikator kepada komunikan melalui media tertentu</li>
        <li>Komunikasi yang efektif terjadi apabila pesan diterima sama dengan yang dimaksud pengirim</li>
        <li>Faktor penghambat: gangguan, perbedaan persepsi, bahasa, emosi, dan lain-lain</li>
        <li>Pengirim harus menyusun pesan dengan jelas, ringkas, dan sesuai konteks penerima</li>
        <li>Penerima harus mendengarkan aktif, memberi umpan balik, dan mengonfirmasi pemahaman</li></ul></div>
        <span class="ba-tag l">SEBELUM</span><span class="ba-tag r">SESUDAH</span><div class="ba-line" id="baLine"></div></div>
      <input type="range" min="0" max="100" value="50" class="ba-range" aria-label="Geser perbandingan">
      <ul class="ba-notes"><li>Satu pesan utama, bukan paragraf</li><li>Ikon dan kartu menggantikan butir panjang</li><li>Hierarki visual: judul, poin, keterangan</li></ul>`;
    const r = $('.ba-range', host), b = $('#baBefore', host), l = $('#baLine', host);
    const set = v => { b.style.clipPath = `inset(0 ${100 - v}% 0 0)`; l.style.left = v + '%'; };
    r.addEventListener('input', () => set(+r.value)); set(50);
  }

  window.openSample = function (kind) {
    if (kind === 'hr') open('Simulasi interaktif (contoh)',
      'Contoh buatan sendiri dengan konten umum untuk memperlihatkan jenis interaksi yang saya bangun di Storyline. Bukan materi perusahaan.',
      [{ name: 'Klik berurutan', build: buildBSC }, { name: 'Drag & drop', build: buildDnD }]);
    if (kind === 'slides') open('Redesain slide (contoh)',
      'Ilustrasi pendekatan redesain presentasi pelatihan dengan konten umum buatan sendiri. Bukan materi perusahaan.',
      [{ name: 'Sebelum / sesudah', build: buildBA }]);
  };
})();
