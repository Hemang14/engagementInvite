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
   same technique as the wedding card's timeline-runner */
(function () {
  const track = document.getElementById('sched-track');
  const runner = document.getElementById('sched-runner');
  if (!track || !runner) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;

  function update() {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const trackHeight = rect.height;
    if (trackHeight <= 0) return;

    const viewportMid = window.innerHeight / 2;
    let progress = (viewportMid - rect.top) / trackHeight;
    progress = Math.max(0, Math.min(1, progress));

    runner.style.top = (track.offsetTop + progress * trackHeight) + 'px';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  if (reduceMotion) {
    runner.style.top = '50%';
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', update);
    update();
  }
})();
