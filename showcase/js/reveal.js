/* ---------------------------------------------------------------------------
   reveal.js — the reveal + counter state machine
   One IntersectionObserver dispatches per target: [data-reveal] → .is-revealed
   (one-shot), [data-count] → rAF count-up. The observer always runs to
   completion regardless of the motion state — motion.css forces those
   elements visible under reduced-motion / motion-off, and skipping the class
   would strand them at opacity 0 once motion is re-enabled later. Only the
   animation is gated, never the state.
--------------------------------------------------------------------------- */

const REVEAL_THRESHOLD = 0.15;
const REVEAL_ROOT_MARGIN = '0px 0px -10% 0px';
const COUNTER_DURATION_MS = 1200;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export function initReveal(motion) {
  stageStagger();
  const targets = [...document.querySelectorAll('[data-reveal], [data-count]')];
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target); // one-shot
      if (entry.target.hasAttribute('data-count')) runCount(entry.target, motion);
      else entry.target.classList.add('is-revealed');
    }
  }, { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN });

  for (const target of targets) observer.observe(target);
}

/* Per-line cascade index: motion.css delays each child by calc(var(--i)*90ms). */
function stageStagger() {
  for (const parent of document.querySelectorAll('[data-stagger]')) {
    [...parent.children].forEach((child, index) => {
      child.style.setProperty('--i', String(index));
    });
  }
}

function runCount(el, motion) {
  const target = Number(el.getAttribute('data-count')) || 0;
  if (!motion.enabled) {
    el.textContent = String(target); // jump instantly, zero frames
    return;
  }
  el.textContent = '0'; // markup ships the final value; the count starts here
  const startedAt = performance.now();
  const tick = (now) => {
    // Live gate: a motion flip mid-count lands on the final value instead of
    // leaving a half-counted number frozen on screen.
    if (!motion.enabled) {
      el.textContent = String(target);
      return;
    }
    const t = Math.min((now - startedAt) / COUNTER_DURATION_MS, 1);
    el.textContent = String(Math.round(easeOutCubic(t) * target));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
