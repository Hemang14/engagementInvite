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
