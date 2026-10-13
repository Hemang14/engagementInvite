// Engagement dinner invite — a single gentle staged fade-in on load, no envelope.

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const groups = [1, 2, 3, 4, 5, 6, 7].map(n =>
    Array.from(document.querySelectorAll('.ei-seq-' + n))
  );

  function reveal(nodes) {
    nodes.forEach(el => el.classList.add('ei-in'));
  }

  if (reduceMotion) {
    groups.forEach(reveal);
    return;
  }

  const START = 200;
  const STEP_GAP = 500;

  let t = START;
  groups.forEach(group => {
    setTimeout(() => reveal(group), t);
    t += STEP_GAP;
  });
})();
