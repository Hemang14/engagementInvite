// Envelope — tap the seal (or "Tap to open") to reveal the card beneath.
// Same open/close behaviour as the main wedding card's envelope, plus the
// theme song: starts 15s in on open, loops, and pauses whenever the tab/app
// is backgrounded (same pattern as the save-the-date card's music).
(function () {
  const envelope = document.getElementById('envelope');
  const card = document.getElementById('card');
  const seal = document.getElementById('seal');
  const envHint = document.getElementById('env-hint');
  if (!envelope || !card || !seal) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Music ----------
  const music = document.getElementById('ec-music');
  const MUSIC_START = 15;
  let musicWanted = false;
  let musicStartSet = false;

  function primeMusicStart() {
    if (musicStartSet || !music) return;
    if (music.duration && music.duration > MUSIC_START) {
      try { music.currentTime = MUSIC_START; musicStartSet = true; } catch (e) {}
    }
  }
  if (music) music.addEventListener('loadedmetadata', primeMusicStart);

  function playMusic() {
    if (!music) return;
    musicWanted = true;
    primeMusicStart();
    music.play().catch(() => {});
  }

  document.addEventListener('visibilitychange', () => {
    if (!music) return;
    if (document.hidden) {
      music.pause();
    } else if (musicWanted) {
      music.play().catch(() => {});
    }
  });

  // a shared #open link skips straight to the card
  if (location.hash === '#open') {
    envelope.remove();
    card.setAttribute('aria-hidden', 'false');
    playMusic();
    return;
  }

  let opened = false;
  function openEnvelope() {
    if (opened) return;
    opened = true;
    card.setAttribute('aria-hidden', 'false');
    envelope.classList.add('open');
    playMusic();
    setTimeout(() => envelope.remove(), reduceMotion ? 0 : 1200);
  }

  seal.addEventListener('click', openEnvelope);
  if (envHint) envHint.addEventListener('click', openEnvelope);
})();

// Welcome page — petal shower drifting down over the hero.
(function () {
  const field = document.getElementById('petals');
  if (!field) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COUNT = 16;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    const size = 7 + Math.random() * 7;           // 7-14px
    const left = Math.random() * 100;              // 0-100%
    const duration = 9 + Math.random() * 7;        // 9-16s
    const delay = -(Math.random() * (9 + 7));      // negative so the field starts already mid-fall
    const sway = (Math.random() * 60 - 30).toFixed(0) + 'px';
    const rot = Math.round(Math.random() * 360) + 'deg';
    const opacity = (0.55 + Math.random() * 0.35).toFixed(2);

    p.style.setProperty('--psize', size.toFixed(1) + 'px');
    p.style.setProperty('--px', left.toFixed(1) + '%');
    p.style.setProperty('--pdur', duration.toFixed(1) + 's');
    p.style.setProperty('--pdelay', delay.toFixed(1) + 's');
    p.style.setProperty('--psway', sway);
    p.style.setProperty('--prot', rot);
    p.style.setProperty('--pop', opacity);

    field.appendChild(p);
  }
})();

// Welcome page — countdown to the ceremony date.

(function () {
  const cdTarget = new Date('2026-12-06T00:00:00+05:30').getTime();
  const cd = {
    d: document.getElementById('ec-cd-d'),
    h: document.getElementById('ec-cd-h'),
    m: document.getElementById('ec-cd-m'),
    s: document.getElementById('ec-cd-s')
  };

  if (cd.d && cd.h && cd.m && cd.s) {
    const tick = () => {
      const diff = cdTarget - Date.now();
      if (diff <= 0) {
        cd.d.textContent = '00'; cd.h.textContent = '00';
        cd.m.textContent = '00'; cd.s.textContent = '00';
        return;
      }
      cd.d.textContent = String(Math.floor(diff / 864e5)).padStart(2, '0');
      cd.h.textContent = String(Math.floor(diff / 36e5) % 24).padStart(2, '0');
      cd.m.textContent = String(Math.floor(diff / 6e4) % 60).padStart(2, '0');
      cd.s.textContent = String(Math.floor(diff / 1e3) % 60).padStart(2, '0');
    };
    tick();
    setInterval(tick, 1000);
  }
})();

/* ---- Schedule runner: rides the dashed line, tracking scroll position ----
   same positioning technique as the wedding card's timeline-runner, plus a
   spotlight pass — each row fades up to full strength as the runner reaches
   it and dims again once it moves on, rather than just revealing once */
(function () {
  const track = document.getElementById('sched-track');
  const runner = document.getElementById('sched-runner');
  const rows = Array.prototype.slice.call(document.querySelectorAll('.sched-row'));
  if (!track || !runner || !rows.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;

  const DIM = 0.3;      // resting opacity for a row the runner isn't near
  const FOCUS_SPAN = 1 / (rows.length - 1) * 0.85; // how close counts as "in focus"

  function update() {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const trackHeight = rect.height;
    if (trackHeight <= 0) return;

    // anchored near the bottom of the viewport (not its midpoint) so the
    // runner finishes its run without needing a deep well of empty padding
    // below the track just to give that anchor room to reach it
    const anchor = window.innerHeight * 0.85;
    let progress = (anchor - rect.top) / trackHeight;
    progress = Math.max(0, Math.min(1, progress));

    runner.style.top = (track.offsetTop + progress * trackHeight) + 'px';

    rows.forEach((row, i) => {
      const rowFraction = rows.length > 1 ? i / (rows.length - 1) : 0;
      const dist = Math.abs(progress - rowFraction);
      const t = Math.max(0, 1 - dist / FOCUS_SPAN); // 1 at the runner, 0 once far away
      const opacity = DIM + (1 - DIM) * t;
      row.style.opacity = opacity.toFixed(3);
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  if (reduceMotion) {
    runner.style.top = '50%';
    rows.forEach(row => { row.style.opacity = '1'; });
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', update);
    update();
  }
})();
