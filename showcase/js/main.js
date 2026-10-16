/* ---------------------------------------------------------------------------
   main.js — the only entry point.
   ES module imports hoist above this line, but every imported module only
   defines functions — so the .js class below is the program's first side
   effect, and it must land before any observer can fire: every pre-state in
   motion.css gates on .js, and no-JS pages render completely untouched.
   Init order matters: the motion toggle boot-applies the stored preference
   first, then the observers and effects wire up against that state.
--------------------------------------------------------------------------- */
import { initReveal } from './reveal.js';
import { initEffects } from './effects.js';
import { initTerminal } from './terminal.js';
import { initAccordion, initMotionToggle } from './accordion.js';

document.documentElement.classList.add('js');

/* Live motion state shared by every effect. Both gates are read on each use:
   prefers-reduced-motion is a system setting that can change mid-session and
   motion-off is user-toggled, so nothing caches a boot-time boolean.
   subscribe() pings listeners when either gate moves — the toggle calls
   notify() from accordion.js, the media query is wired here once. */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set();

const motion = {
  get enabled() {
    return !reducedMotion.matches
      && !document.documentElement.classList.contains('motion-off');
  },
  subscribe(listener) {
    listeners.add(listener);
  },
  notify() {
    for (const listener of listeners) listener();
  },
};

reducedMotion.addEventListener('change', () => motion.notify());

initMotionToggle(motion);
initReveal(motion);
initEffects(motion);
initTerminal(motion);
initAccordion();
