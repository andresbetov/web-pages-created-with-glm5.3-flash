/* ---------------------------------------------------------------------------
   effects.js — pointer + scroll choreography
   Cursor glow (lerped translate3d), magnetic buttons, card tilt, the
   .is-scrolled header state and the scroll-progress JS fallback. Every gate
   (pointer:fine, prefers-reduced-motion, html.motion-off) is re-derived on
   each use — system settings and the in-page toggle can change mid-session,
   so nothing here caches a boot-time boolean.
--------------------------------------------------------------------------- */

const finePointer = matchMedia('(pointer: fine)');
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const GLOW_LERP = 0.12;      // fraction of the remaining distance per frame
const GLOW_SETTLE_PX = 0.5;  // stop the loop once the glide has arrived
const MAGNETIC_PULL = 0.35;  // cursor offset → button offset
const MAGNETIC_CAP_PX = 12;
const MAGNETIC_RELEASE_MS = 450;
const MAGNETIC_RELEASE_EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';
const TILT_MAX_DEG = 8;
const TILT_PERSPECTIVE_PX = 800;
const SCROLLED_PX = 8;       // header carries .is-scrolled past this

export function initEffects(motion) {
  initScrollEffects(motion);
  initCursorGlow(motion);
  initMagnetic(motion);
  initTilt(motion);
}

/* One rAF-coalesced passive scroll listener drives both scroll states: the
   header class always, the progress rail only on engines motion.css can't
   own (@supports (animation-timeline: scroll())). */
function initScrollEffects(motion) {
  const header = document.querySelector('.site-header');
  const progress = document.getElementById('scroll-progress');
  if (!header && !progress) return;

  const cssOwnsProgress = CSS.supports('animation-timeline: scroll()');

  let queued = false;
  const update = () => {
    queued = false;
    header?.classList.toggle('is-scrolled', window.scrollY > SCROLLED_PX);
    if (!progress || cssOwnsProgress) return;
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    // scaleX, never width — transform is compositor-only, width would
    // relayout the fixed header every frame. Under motion-off the rail parks
    // at its base state, matching what motion.css does to the CSS-driven path.
    const fraction = motion.enabled ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = `scaleX(${fraction})`;
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  if (!cssOwnsProgress) motion.subscribe(schedule);
  update();
}

function initCursorGlow(motion) {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let raf = 0;
  let placed = false;

  const allowed = () => finePointer.matches && motion.enabled;

  const park = () => {
    glow.style.display = 'none'; // display, not off-canvas translate: a parked
    glow.style.transform = '';   // 24rem blur+blend layer still costs compositing
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    placed = false;
  };
  const applyState = () => {
    if (allowed()) {
      glow.style.display = '';
      return;
    }
    park(); // transform cleared → back to the parked spot base.css owns
  };

  const tick = () => {
    raf = 0;
    if (!allowed()) {
      park();
      return;
    }
    currentX += (targetX - currentX) * GLOW_LERP;
    currentY += (targetY - currentY) * GLOW_LERP;
    glow.style.transform =
      `translate3d(${currentX - glow.offsetWidth / 2}px, ${currentY - glow.offsetHeight / 2}px, 0)`;
    const settled = Math.abs(targetX - currentX) < GLOW_SETTLE_PX
      && Math.abs(targetY - currentY) < GLOW_SETTLE_PX;
    if (!settled) raf = requestAnimationFrame(tick);
  };

  window.addEventListener('pointermove', (event) => {
    if (!allowed()) return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!placed) { // first appearance sits on the cursor — no fly-in across the page
      currentX = targetX;
      currentY = targetY;
      placed = true;
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  finePointer.addEventListener('change', applyState);
  motion.subscribe(applyState);
  applyState();
}

/* Tracking rides the CSS-owned .25s transform transition on .btn — restarting
   it on every mousemove yields a soft trailing pull with no JS easing code.
   Only the release needs its own longer, springier curve. */
function initMagnetic(motion) {
  const targets = [...document.querySelectorAll('[data-magnetic]')];
  if (!targets.length) return;
  const tracking = new WeakSet();

  const allowed = () => finePointer.matches && motion.enabled;
  const clear = (el) => {
    el.style.transform = '';
    el.style.transition = '';
  };

  for (const el of targets) {
    el.addEventListener('mouseenter', () => {
      el.style.transition = ''; // drop a leftover release curve before tracking
    });
    el.addEventListener('mousemove', (event) => {
      if (!allowed()) return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      tracking.add(el);
      el.style.transform =
        `translate(${clamp(dx * MAGNETIC_PULL, -MAGNETIC_CAP_PX, MAGNETIC_CAP_PX)}px, ` +
        `${clamp(dy * MAGNETIC_PULL, -MAGNETIC_CAP_PX, MAGNETIC_CAP_PX)}px)`;
    }, { passive: true });
    el.addEventListener('mouseleave', () => {
      tracking.delete(el);
      if (!allowed()) {
        clear(el);
        return;
      }
      el.style.transition = `transform ${MAGNETIC_RELEASE_MS}ms ${MAGNETIC_RELEASE_EASING}`;
      el.style.transform = 'translate(0, 0)';
    });
    el.addEventListener('transitionend', (event) => {
      // A finished tracking transition must NOT clear the magnet offset —
      // only the release transition may hand the element back to CSS.
      if (event.propertyName !== 'transform' || tracking.has(el)) return;
      clear(el);
    });
  }

  motion.subscribe(() => {
    for (const el of targets) {
      tracking.delete(el);
      clear(el); // a motion flip mid-hover snaps the button home
    }
  });
}

function initTilt(motion) {
  const cards = [...document.querySelectorAll('[data-tilt]')];
  if (!cards.length) return;

  const allowed = () => finePointer.matches && motion.enabled;
  const reset = (card) => {
    card.style.transform = '';
    // Sheen coordinates: no shipped CSS rule consumes --mx/--my yet (Task 2's
    // sweep is a hover pseudo) — written anyway so a var()-based sheen can
    // land later without touching this module.
    card.style.removeProperty('--mx');
    card.style.removeProperty('--my');
  };

  for (const card of cards) {
    card.addEventListener('mousemove', (event) => {
      if (!allowed()) {
        if (card.style.transform) reset(card);
        return;
      }
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const nx = px * 2 - 1; // center-relative, [-1 … 1]
      const ny = py * 2 - 1;
      // rotateY follows the horizontal offset, rotateX the vertical inverted —
      // the card tips its top edge toward the cursor, leaning in to meet it.
      card.style.transform =
        `perspective(${TILT_PERSPECTIVE_PX}px) ` +
        `rotateX(${(-ny * TILT_MAX_DEG).toFixed(2)}deg) ` +
        `rotateY(${(nx * TILT_MAX_DEG).toFixed(2)}deg)`;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    }, { passive: true });
    card.addEventListener('mouseleave', () => reset(card));
  }

  motion.subscribe(() => cards.forEach(reset));
}
