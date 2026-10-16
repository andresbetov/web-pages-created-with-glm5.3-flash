/* ---------------------------------------------------------------------------
   accordion.js — disclosure accordion + the motion preference toggle
   One panel open at a time. The CSS animates .panel-grid's grid-template-rows
   0fr→1fr, so JS only flips state: aria-expanded on the trigger, .is-open on
   the grid — and inert on closed .panel content, which lifts it out of the
   tab order while its (clipped) box still exists for the transition.
   No `hidden` attribute anywhere: it would kill the height animation.
--------------------------------------------------------------------------- */

const MOTION_STORAGE_KEY = 'motion'; // stored value 'true' = motion parked off

export function initAccordion() {
  const root = document.querySelector('[data-accordion]');
  if (!root) return;

  // Resolve panels through aria-controls — the way assistive tech does —
  // rather than assuming DOM order; the panel's parent is the .panel-grid.
  const items = [...root.querySelectorAll('[data-accordion-trigger]')]
    .map((trigger) => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls') ?? '');
      return panel ? { trigger, grid: panel.parentElement, panel } : null;
    })
    .filter(Boolean);

  const setOpen = (openItem) => {
    for (const item of items) {
      const open = item === openItem;
      item.trigger.setAttribute('aria-expanded', String(open));
      item.grid?.classList.toggle('is-open', open);
      item.panel?.toggleAttribute('inert', !open);
    }
  };

  for (const item of items) {
    item.trigger.addEventListener('click', () => {
      // Clicking the open step closes it (disclosure semantics); at most one
      // is ever open at a time.
      setOpen(item.trigger.getAttribute('aria-expanded') === 'true' ? null : item);
    });
  }

  // With JS, step 1 starts open so the demo narrates itself; without JS all
  // four stay collapsed exactly as shipped.
  if (items.length) setOpen(items[0]);
}

export function initMotionToggle(motion) {
  const button = document.getElementById('motion-toggle');
  const root = document.documentElement;

  const readStored = () => {
    try {
      return localStorage.getItem(MOTION_STORAGE_KEY) === 'true';
    } catch {
      return false; // storage unavailable → motion on
    }
  };
  const writeStored = (off) => {
    try {
      localStorage.setItem(MOTION_STORAGE_KEY, String(off));
    } catch {
      /* private mode: the preference just won't survive a reload */
    }
  };

  const apply = (off) => {
    root.classList.toggle('motion-off', off);
    button?.setAttribute('aria-pressed', String(off));
    motion.notify(); // every effect re-gates itself on the state change
  };

  // Boot first (main.js calls this before any effect init) so every effect
  // initializes against the stored preference, not the default.
  apply(readStored());

  button?.addEventListener('click', () => {
    const off = !root.classList.contains('motion-off');
    apply(off);
    writeStored(off);
  });
}
