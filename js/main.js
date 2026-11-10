// ====== Konfigurasi ======
const GITHUB_USER = 'tephania88';
const GITHUB_TOPIC = 'portfolio'; // beri topic ini di repo mana pun agar muncul otomatis

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// ====== Tema ======
const root = document.documentElement;
try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
$('#themeToggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});
$('#year').textContent = new Date().getFullYear();

// ====== Smooth scroll (Lenis) + GSAP ======
gsap.registerPlugin(ScrollTrigger);
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -60, duration: 1.4 }); }
  }));
}

// Progress bar
gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { scrub: 0.3, start: 0, end: 'max' } });

// Hero intro
if (!reduce) {
  gsap.set('.word', { yPercent: 110 });
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .to('.word', { yPercent: 0, duration: 1.3, stagger: 0.12 }, 0.1)
    .from('.hero .reveal', { y: 30, opacity: 0, duration: 1, stagger: 0.12 }, 0.6);
  gsap.to('.hero-title', { yPercent: -15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

// Pop-up saat scroll
function revealAll(scope = document) {
  if (reduce) return;
  $$('.reveal', scope).forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from(el, { y: 60, opacity: 0, scale: 0.96, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
}
revealAll();

// Counter
$$('[data-count]').forEach(el => {
  const end = +el.dataset.count;
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => {
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) + '+' });
  }});
});

// ====== Kursor + magnetic ======
if (matchMedia('(hover:hover)').matches && !reduce) {
  const c = $('#cursor');
  const qx = gsap.quickTo(c, 'x', { duration: 0.25, ease: 'power3' });
  const qy = gsap.quickTo(c, 'y', { duration: 0.25, ease: 'power3' });
  addEventListener('mousemove', e => { c.style.opacity = 1; qx(e.clientX); qy(e.clientY); });
  const grow = on => gsap.to(c, { scale: on ? 3 : 1, duration: 0.3 });
  document.addEventListener('mouseover', e => { if (e.target.closest('a,button,.card,.chip')) grow(true); });
  document.addEventListener('mouseout', e => { if (e.target.closest('a,button,.card,.chip')) grow(false); });

  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4 });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' }));
  });
}

// ====== Project: projects.json + GitHub API ======
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

async function loadProjects() {
  const list = [];
  try {
    const r = await fetch('projects.json', { cache: 'no-cache' });
    if (r.ok) list.push(...await r.json());
  } catch (e) {}
  try {
    const r = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`);
    if (r.ok) {
      const repos = await r.json();
      repos.filter(x => !x.fork && (x.topics || []).includes(GITHUB_TOPIC)).forEach(x => {
        if (list.some(p => (p.repo || '').toLowerCase() === x.html_url.toLowerCase())) return;
        list.push({ title: x.name.replace(/[-_]/g, ' '), description: x.description || 'Belum ada deskripsi.',
          tags: [x.language, ...(x.topics || []).filter(t => t !== GITHUB_TOPIC)].filter(Boolean),
          repo: x.html_url, demo: x.homepage || '' });
      });
    }
  } catch (e) {}
  return list;
}

function tilt(card) {
  if (reduce || !matchMedia('(hover:hover)').matches) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card, { rotateY: x * 10, rotateX: -y * 10, duration: 0.4 });
  });
  card.addEventListener('mouseleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6 }));
}

(async function render() {
  const grid = $('#projectGrid');
  const items = await loadProjects();
  if (!items.length) { grid.innerHTML = '<p class="muted">Belum ada project. Tambahkan di projects.json atau beri topic "portfolio" pada repo GitHub.</p>'; return; }
  grid.innerHTML = items.map(p => `
    <article class="card">
      <div class="card-img">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : esc((p.title || '?')[0].toUpperCase())}</div>
      <div class="card-body">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="card-links">
          ${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">Demo ↗</a>` : ''}
          ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Kode ↗</a>` : ''}
        </div>
      </div>
    </article>`).join('');
  $$('.card', grid).forEach(tilt);
  if (!reduce) gsap.from('.card', { y: 70, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
    scrollTrigger: { trigger: grid, start: 'top 85%', once: true } });
  ScrollTrigger.refresh();
})();
