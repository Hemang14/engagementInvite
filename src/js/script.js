// Engagement dinner invite — a single gentle staged fade-in on load, no envelope.

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const petals = document.getElementById('ei-petals');
  if (petals && !reduceMotion) {
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('span');
      p.className = 'ei-petal';
      const size = 4 + Math.random() * 4;
      p.style.left = Math.random() * 100 + '%';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.animationDuration = (7 + Math.random() * 7) + 's';
      p.style.animationDelay = -Math.random() * 12 + 's';
      p.style.opacity = 0.3 + Math.random() * 0.4;
      petals.appendChild(p);
    }
  }

  const groups = [1, 2, 3, 4, 5, 6, 7].map(n =>
    Array.from(document.querySelectorAll('.ei-seq-' + n))
  );

  function reveal(nodes) {
    nodes.forEach(el => el.classList.add('ei-in'));
  }

  if (reduceMotion) {
    groups.forEach(reveal);
  } else {
    const START = 200;
    const STEP_GAP = 500;

    let t = START;
    groups.forEach(group => {
      setTimeout(() => reveal(group), t);
      t += STEP_GAP;
    });
  }

  // ---------- Add to calendar ----------
  // Tapping the date adds the engagement dinner to the guest's calendar,
  // same pattern as the other cards: a downloadable .ics on iOS/desktop
  // (Chrome hands it straight to Apple Calendar), a direct Google Calendar
  // link on Android.

  function icsEvent(uid, title, start, end) {
    return [
      'BEGIN:VEVENT',
      `UID:${uid}@dkengagement`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      'LOCATION:IIDM Resort\\, Lucknow',
      'END:VEVENT'
    ].join('\r\n');
  }

  function downloadICS(filename, events) {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DK Engagement//EN',
      'CALSCALE:GREGORIAN',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function googleCalUrl(title, start, end) {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${start}/${end}`,
      location: 'IIDM Resort, Lucknow'
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const calTitle = 'Engagement Dinner — Dishakkshi & Kartikay';
  // Friday 11 Dec 2026, 8–11 PM IST, in UTC for the ICS/Google Calendar link
  const calStart = '20261211T143000Z';
  const calEnd = '20261211T173000Z';

  const dateCal = document.getElementById('ei-date-cal');
  if (dateCal) {
    dateCal.addEventListener('click', () => {
      if (isAndroid && !isIOS) {
        window.open(googleCalUrl(calTitle, calStart, calEnd), '_blank', 'noopener');
      } else {
        downloadICS('DK-Engagement-Dinner.ics', [icsEvent('engagement', calTitle, calStart, calEnd)]);
      }
    });
  }

  // ---------- RSVP pop-up ----------

  const rsvpTrigger = document.getElementById('ei-rsvp-trigger');
  const rsvpModal = document.getElementById('ei-rsvp-modal');
  const rsvpBackdrop = document.getElementById('ei-rsvp-backdrop');
  const rsvpClose = document.getElementById('ei-rsvp-close');
  const rsvpForm = document.getElementById('ei-rsvp-form');
  const rsvpThanks = document.getElementById('ei-modal-thanks');

  function openRsvp() {
    if (!rsvpModal) return;
    rsvpModal.classList.add('ei-open');
    rsvpModal.setAttribute('aria-hidden', 'false');
  }

  function closeRsvp() {
    if (!rsvpModal) return;
    rsvpModal.classList.remove('ei-open');
    rsvpModal.setAttribute('aria-hidden', 'true');
  }

  if (rsvpTrigger) rsvpTrigger.addEventListener('click', openRsvp);
  if (rsvpBackdrop) rsvpBackdrop.addEventListener('click', closeRsvp);
  if (rsvpClose) rsvpClose.addEventListener('click', closeRsvp);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeRsvp();
  });

  if (rsvpForm && rsvpThanks) {
    rsvpForm.addEventListener('submit', () => {
      setTimeout(() => {
        rsvpForm.hidden = true;
        rsvpThanks.hidden = false;
      }, 400);
    });
  }

  // guest count: 0 is only offered once someone says they can't make it
  const countInput = document.getElementById('ei-f-count');
  const attendRadios = rsvpForm ? rsvpForm.querySelectorAll('input[name="entry.707843021"]') : [];

  attendRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (!countInput || !radio.checked) return;
      const declining = radio.value.startsWith('Sadly');
      if (declining) {
        countInput.min = '0';
        countInput.value = '0';
      } else {
        countInput.min = '1';
        if (Number(countInput.value) < 1) countInput.value = '1';
      }
    });
  });
})();
