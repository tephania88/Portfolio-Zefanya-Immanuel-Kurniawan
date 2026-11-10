// Self-made sample simulations with GENERIC content (not company material).
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Modal ----------
  const modal = document.createElement('div');
  modal.className = 'sim'; modal.hidden = true;
  modal.innerHTML = `<div class="sim-box" role="dialog" aria-modal="true">
    <button class="sim-close" aria-label="Close">✕</button>
    <h3 class="sim-title"></h3><p class="sim-note"></p>
    <div class="sim-tabs" role="tablist"></div><div class="sim-body"></div></div>`;
  document.body.appendChild(modal);
  const box = $('.sim-box', modal), body = $('.sim-body', modal), tabs = $('.sim-tabs', modal);
  const stopTimers = () => (modal._timers || []).forEach(clearInterval);
  const close = () => { stopTimers(); modal.hidden = true; body.innerHTML = ''; document.body.style.overflow = ''; };
  $('.sim-close', modal).addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (!modal.hidden && e.key === 'Escape') close(); });

  function open(title, note, defs) {
    $('.sim-title', modal).textContent = title;
    $('.sim-note', modal).textContent = note;
    tabs.innerHTML = defs.map((d, i) => `<button role="tab" data-t="${i}">${d.name}</button>`).join('');
    const show = i => {
      stopTimers(); modal._timers = [];
      $$('button', tabs).forEach((b, k) => b.classList.toggle('on', k === i));
      body.innerHTML = ''; const host = document.createElement('div'); body.appendChild(host); defs[i].build(host);
      if (window.gsap && !calm) gsap.from(host, { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' });
    };
    tabs.onclick = e => { const b = e.target.closest('button'); if (b) show(+b.dataset.t); };
    modal.hidden = false; document.body.style.overflow = 'hidden'; show(0);
    if (window.gsap && !calm) gsap.fromTo(box, { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' });
  }

  // ---------- 1) Balanced Scorecard: sequenced click-through ----------
  function buildBSC(host) {
    const P = [
      ['Financial', '"How do we look to our shareholders?"', 'top'],
      ['Customer', '"How do our customers see us?"', 'left'],
      ['Internal Process', '"Which processes must we excel at?"', 'right'],
      ['Learning & Growth', '"How do we keep improving and creating value?"', 'bottom']
    ];
    let done = 0;
    host.innerHTML = `<p class="sim-hint">Start with perspective 1. The next perspective unlocks after each click.</p>
      <div class="bsc"><div class="bsc-core">Vision &amp;<br>Strategy</div>
      ${P.map((p, i) => `<button class="bsc-node ${p[2]}" data-i="${i}" ${i ? 'disabled' : ''}><small>PERSPECTIVE 0${i + 1}</small>${p[0]}</button>`).join('')}
      <div class="bsc-panel"><small>How to explore</small><p>Every perspective starts from <b>Vision &amp; Strategy</b>. Click <b>Perspective 01</b> to begin.</p></div></div>
      <p class="sim-done" hidden>✓ All perspectives are aligned with the vision and strategy.</p>`;
    const nodes = $$('.bsc-node', host), panel = $('.bsc-panel', host);
    nodes[0].classList.add('pulse');
    nodes.forEach((n, i) => n.addEventListener('click', () => {
      n.classList.remove('pulse'); n.classList.add('seen');
      panel.innerHTML = `<small>PERSPECTIVE 0${i + 1} / 04</small><h4>${P[i][0]}</h4><p>${P[i][1]}</p>`;
      if (window.gsap && !calm) gsap.from(panel, { x: 16, opacity: 0, duration: 0.35 });
      if (i === done) {
        done++;
        if (nodes[done]) { nodes[done].disabled = false; nodes[done].classList.add('pulse'); }
        else $('.sim-done', host).hidden = false;
      }
    }));
  }

  // ---------- 2) Drag & drop: recruitment process ----------
  function buildDnD(host) {
    const S = ['Requisition', 'Sourcing', 'Selection', 'Hiring', 'Onboarding'];
    const A = [
      ['Approve the vacancy request', 0], ['Post the job opening', 1], ['Screen the CVs', 1], ['Interview candidates', 2],
      ['Run a competency test', 2], ['Send the job offer', 3], ['Hold the first-day orientation', 4], ['Prepare work facilities', 4]
    ];
    let ok = 0, sel = null;
    host.innerHTML = `<p class="sim-hint">Drag each card to the right stage (or tap a card, then tap the stage).</p>
      <div class="dnd-stages">${S.map((s, i) => `<div class="dnd-stage" data-s="${i}"><b>0${i + 1} ${s}</b><div class="dnd-drop"></div></div>`).join('')}</div>
      <div class="dnd-pool">${A.map((a, i) => `<div class="dnd-chip" draggable="true" data-s="${a[1]}" data-i="${i}">${a[0]}</div>`).join('')}</div>
      <p class="dnd-msg" aria-live="polite">0 / ${A.length} correct</p><button class="sim-reset">Restart</button>`;
    const msg = $('.dnd-msg', host);
    const place = (chip, stage) => {
      if (+chip.dataset.s === +stage.dataset.s) {
        $('.dnd-drop', stage).appendChild(chip); chip.draggable = false; chip.classList.add('ok'); chip.classList.remove('sel'); sel = null; ok++;
        msg.textContent = ok === A.length ? '🎉 All stages are correct! The recruitment process is complete.' : `${ok} / ${A.length} correct`;
        if (window.gsap && !calm) gsap.from(chip, { scale: 0.8, duration: 0.35, ease: 'back.out(2)' });
      } else {
        stage.classList.add('shake'); setTimeout(() => stage.classList.remove('shake'), 400);
        msg.textContent = 'Not quite, try another stage.';
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

  // ---------- 3) Scenario: branching questions with feedback ----------
  function buildScenario(host) {
    const Q = [
      { q: 'A team member has missed their targets for two months in a row. What should you do first?',
        o: [['Give a written warning right away', 0, 'Too early. Start by understanding the cause before escalating.'],
            ['Hold a 1:1 conversation to understand the causes', 2, 'Correct. Two-way communication comes first, then agree on support.'],
            ['Wait for the year-end review', 0, 'Waiting lets the problem grow. Coaching should be continuous.']] },
      { q: 'The conversation shows the target is clear, but the person lacks one key skill. What next?',
        o: [['Agree on a development plan with a check-in schedule', 2, 'Correct. A specific plan with follow-ups turns feedback into progress.'],
            ['Reassign the work to someone else', 1, 'Possible, but it solves the task, not the skill gap.'],
            ['Lower the target silently', 0, 'This hides the issue and weakens fairness for the rest of the team.']] },
      { q: 'After three months there is no improvement despite coaching. What is the best step?',
        o: [['Consult HR to arrange a structured improvement plan', 2, 'Correct. A documented plan with clear goals and review points is fair for everyone.'],
            ['Ignore it to avoid conflict', 0, 'Unresolved issues affect the team and the person involved.'],
            ['Announce it in the team meeting', 0, 'Never discuss individual performance in public.']] }
    ];
    let i = 0, score = 0;
    const draw = () => {
      if (i >= Q.length) {
        host.innerHTML = `<div class="quiz-end"><h4>Score: ${score} / ${Q.length * 2}</h4>
          <p>${score >= 5 ? 'Great judgement. You balance support and accountability.' : 'Good start. Review the feedback and try again.'}</p>
          <button class="sim-reset">Try again</button></div>`;
        $('.sim-reset', host).addEventListener('click', () => { i = 0; score = 0; draw(); }); return;
      }
      const c = Q[i];
      host.innerHTML = `<p class="sim-hint">Scenario ${i + 1} of ${Q.length}</p><h4 class="quiz-q">${c.q}</h4>
        <div class="quiz-opts">${c.o.map((o, k) => `<button class="quiz-opt" data-k="${k}">${o[0]}</button>`).join('')}</div>
        <div class="quiz-fb" aria-live="polite"></div>`;
      $$('.quiz-opt', host).forEach(b => b.addEventListener('click', () => {
        const o = c.o[+b.dataset.k]; score += o[1];
        $$('.quiz-opt', host).forEach(x => x.disabled = true);
        b.classList.add(o[1] === 2 ? 'good' : o[1] === 1 ? 'mid' : 'bad');
        const fb = $('.quiz-fb', host);
        fb.innerHTML = `<p>${o[2]}</p><button class="sim-reset">${i === Q.length - 1 ? 'See result' : 'Next scenario →'}</button>`;
        if (window.gsap && !calm) gsap.from(fb, { y: 12, opacity: 0, duration: 0.35 });
        $('.sim-reset', fb).addEventListener('click', () => { i++; draw(); });
      }));
    };
    draw();
  }

  // ---------- 4) Timeline: improvement plan route ----------
  function buildTimeline(host) {
    const T = [
      ['Month 1', 'Launch the plan', 'HR issues the plan form. Leader and employee agree on goals and tasks for 6 months.'],
      ['Month 2', 'Approval & acknowledgement', 'The next-level superior approves, and both sides sign to acknowledge the plan.'],
      ['Month 3', 'Monthly review', 'Progress is reviewed and updated every month with specific feedback.'],
      ['Month 4', 'Coaching support', 'The leader removes blockers and provides coaching or resources where needed.'],
      ['Month 5', 'Mid-course check', 'Compare results with targets and adjust the tasks if needed.'],
      ['Month 6', 'Final assessment', 'The leader assesses achievement, the employee acknowledges the outcome, and the result is recorded.']
    ];
    let seen = 0;
    host.innerHTML = `<p class="sim-hint">Click each month in order to follow a generic 6-month improvement route.</p>
      <div class="tl-track"><div class="tl-bar"><i></i></div>${T.map((t, i) => `<button class="tl-dot" data-i="${i}" ${i ? 'disabled' : ''}><b>${i + 1}</b><small>${t[0]}</small></button>`).join('')}</div>
      <div class="tl-card"><small>Route map</small><p>Select <b>Month 1</b> to begin.</p></div>`;
    const dots = $$('.tl-dot', host), card = $('.tl-card', host), bar = $('.tl-bar i', host);
    dots[0].classList.add('pulse');
    dots.forEach((d, i) => d.addEventListener('click', () => {
      d.classList.remove('pulse'); d.classList.add('seen');
      card.innerHTML = `<small>${T[i][0].toUpperCase()}</small><h4>${T[i][1]}</h4><p>${T[i][2]}</p>`;
      if (window.gsap && !calm) gsap.from(card, { y: 12, opacity: 0, duration: 0.35 });
      if (i === seen) { seen++; bar.style.width = (seen / T.length * 100) + '%'; if (dots[seen]) { dots[seen].disabled = false; dots[seen].classList.add('pulse'); } }
    }));
  }

  // ---------- 5) Before / after slide redesign ----------
  function buildBA(host) {
    host.innerHTML = `<p class="sim-hint">Drag the slider to compare a slide before and after the redesign (generic example made for this portfolio).</p>
      <div class="ba"><div class="ba-slide ba-after"><h4>3 Keys to Effective Communication</h4>
        <div class="ba-cards"><div><span>🎯</span><b>Clear</b><small>One key message per slide</small></div>
        <div><span>👂</span><b>Listen</b><small>Make room for questions</small></div>
        <div><span>🤝</span><b>Empathize</b><small>Understand the other person's view</small></div></div></div>
        <div class="ba-slide ba-before" id="baBefore"><h4>Effective Communication</h4>
        <ul><li>Communication is the process of delivering a message from a communicator to a communicant through a certain medium</li>
        <li>Effective communication occurs when the message received is the same as the one the sender intended</li>
        <li>Barriers include noise, differences in perception, language, emotion, and others</li>
        <li>The sender must structure the message clearly, concisely, and in line with the receiver's context</li>
        <li>The receiver must listen actively, give feedback, and confirm understanding</li></ul></div>
        <span class="ba-tag l">BEFORE</span><span class="ba-tag r">AFTER</span><div class="ba-line" id="baLine"></div></div>
      <input type="range" min="0" max="100" value="50" class="ba-range" aria-label="Compare before and after">
      <ul class="ba-notes"><li>One main message instead of a paragraph</li><li>Icons and cards replace long bullet lists</li><li>Clear visual hierarchy: title, key points, support text</li></ul>`;
    const r = $('.ba-range', host), b = $('#baBefore', host), l = $('#baLine', host);
    const set = v => { b.style.clipPath = `inset(0 ${100 - v}% 0 0)`; l.style.left = v + '%'; };
    r.addEventListener('input', () => set(+r.value)); set(50);
  }

  // ---------- 6) Sticky-note group activity ----------
  function buildSticky(host) {
    const N = [
      ['Survey', 'What is one change that would make our weekly meeting more useful?'],
      ['Interview', 'Describe a time when feedback helped you improve. What made it work?'],
      ['Routine', 'Which daily habit saves your team the most time?'],
      ['Training', 'Which skill would you like to practice in the next session?'],
      ['Monitoring', 'How will we know the change is working in one month?']
    ];
    let seen = new Set();
    host.innerHTML = `<p class="sim-hint">Group activity: click each sticky note to reveal the discussion prompt.</p>
      <div class="sticky-board">${N.map((n, i) => `<button class="sticky" data-i="${i}" style="--r:${(i % 2 ? 2 : -2) + i * 0.4}deg"><b>${n[0]}</b><span>Click to reveal</span></button>`).join('')}</div>
      <div class="sticky-prompt" aria-live="polite">Select a note to see its question.</div>
      <p class="sim-done" hidden>✓ All prompts discussed. Ask each group to share one insight.</p>`;
    $$('.sticky', host).forEach(s => s.addEventListener('click', () => {
      const i = +s.dataset.i; seen.add(i); s.classList.add('seen'); $('span', s).textContent = 'Discussed ✓';
      const p = $('.sticky-prompt', host); p.textContent = N[i][1];
      if (window.gsap && !calm) { gsap.from(p, { y: 10, opacity: 0, duration: 0.3 }); gsap.fromTo(s, { rotate: -6 }, { rotate: 0, duration: 0.4, ease: 'back.out(3)' }); }
      if (seen.size === N.length) $('.sim-done', host).hidden = false;
    }));
  }

  // ---------- 7) Role-play rounds with a timer ----------
  function buildRounds(host) {
    const R = [
      ['Round 1', 'Pros & Cons', 'List the strengths and the weaknesses of the idea. No arguing yet, only listing.'],
      ['Round 2', 'Debate', 'One side defends the idea, the other challenges it. Keep it respectful.'],
      ['Round 3', 'Paraphrase', 'Before replying, restate what the other person said in your own words.'],
      ['Round 4', 'Empathy & Appreciation', 'Say what you understand about their view and one thing you appreciate.']
    ];
    host.innerHTML = `<p class="sim-hint">Role-play: pick a round to see the instructions, then start the 60-second timer.</p>
      <div class="rounds">${R.map((r, i) => `<button class="round c${i}" data-i="${i}"><b>${r[0]}</b><span>${r[1]}</span></button>`).join('')}</div>
      <div class="round-panel"><small>Instructions</small><p>Select a round.</p></div>`;
    const panel = $('.round-panel', host);
    $$('.round', host).forEach(b => b.addEventListener('click', () => {
      stopTimers(); modal._timers = [];
      $$('.round', host).forEach(x => x.classList.remove('on')); b.classList.add('on');
      const r = R[+b.dataset.i];
      panel.innerHTML = `<small>${r[0].toUpperCase()}</small><h4>${r[1]}</h4><p>${r[2]}</p><div class="timer"><b>60</b><button class="sim-reset">Start timer</button></div>`;
      if (window.gsap && !calm) gsap.from(panel, { y: 12, opacity: 0, duration: 0.35 });
      $('.sim-reset', panel).addEventListener('click', e => {
        stopTimers(); let t = 60; const out = $('.timer b', panel); out.textContent = t; e.target.textContent = 'Restart';
        const id = setInterval(() => { t--; out.textContent = t; if (t <= 0) { clearInterval(id); out.textContent = 'Time!'; } }, 1000);
        modal._timers = [id];
      });
    }));
  }

  window.openSample = function (kind) {
    if (kind === 'hr') open('Interactive simulations (samples)',
      'Self-made samples with generic content that show the types of interactions I build in Storyline. Not company material.',
      [{ name: 'Click-through', build: buildBSC }, { name: 'Drag & drop', build: buildDnD },
       { name: 'Scenario', build: buildScenario }, { name: 'Timeline', build: buildTimeline }]);
    if (kind === 'slides') open('Slide redesign & activities (samples)',
      'Self-made samples with generic content that illustrate my approach to training presentations. Not company material.',
      [{ name: 'Before / after', build: buildBA }, { name: 'Sticky notes', build: buildSticky }, { name: 'Role-play rounds', build: buildRounds }]);
  };
})();
