/* ---------------------------------------------------------------------------
   terminal.js — the self-typing console
   Six lines typed character-by-character once the terminal scrolls into view.
   The motion state is checked live between characters: reduced-motion or
   motion-off (before or mid-type) print everything instantly — the text is
   the content, so it must land complete either way. .is-typing marks the
   active session — motion.css hangs the blinking block caret on it while it
   stands and removes it when the session completes; the ▍ inside the typed
   lines is literal console output and stays for good.

   Screen-reader parity (A1): typed characters stay silent — the pre is not a
   live region. When the session completes (typed, printed or mid-flip), one
   visually-hidden summary line lands in the [data-terminal-summary] status
   paragraph so AT hears a single complete statement instead of a token stream.
--------------------------------------------------------------------------- */

const REVEAL_THRESHOLD = 0.15;
const REVEAL_ROOT_MARGIN = '0px 0px -10% 0px';
const TYPE_CHAR_MS = 18;
const COMMAND_BEAT_MS = 420; // the prompt "executes" before output streams
const LINE_BEAT_MS = 140;
const SESSION_SUMMARY =
  'Session complete — tokens OK, animations OK, contrast AA, zero dependencies.';

const TERMINAL_LINES = [
  '$ opencode run showcase',
  '→ composing design tokens … ok',
  '→ animating every section … ok',
  '→ auditing contrast … AA passed',
  '→ zero dependencies attached',
  '▍ done in 1 session.',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function initTerminal(motion) {
  const terminal = document.querySelector('.terminal');
  const output = document.querySelector('[data-terminal-output]');
  const summary = document.querySelector('[data-terminal-summary]');
  const idle = document.querySelector('[data-terminal-idle]');
  if (!terminal || !output) return;

  const complete = () => {
    if (summary) summary.textContent = SESSION_SUMMARY; // textContent: idempotent, never repeats
  };

  const printAll = () => {
    output.textContent = TERMINAL_LINES.join('\n');
    complete();
  };

  const type = async () => {
    terminal.classList.add('is-typing');
    let printed = '';
    for (let i = 0; i < TERMINAL_LINES.length; i++) {
      if (i > 0) {
        await sleep(i === 1 ? COMMAND_BEAT_MS : LINE_BEAT_MS);
        printed += '\n'; // lines join in the pre exactly as printAll renders them
      }
      for (const char of TERMINAL_LINES[i]) {
        if (!motion.enabled) { // flip mid-type → finish instantly, no frozen line
          printAll();
          terminal.classList.remove('is-typing');
          return;
        }
        printed += char;
        output.textContent = printed; // the caret is motion.css's ::after, never text
        await sleep(TYPE_CHAR_MS);
      }
    }
    terminal.classList.remove('is-typing'); // caret leaves with .is-typing
    complete();
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target); // one session, never replayed
      idle?.remove(); // the "▍ idle" placeholder's shift ends when the session starts
      if (motion.enabled) type();
      else printAll();
    }
  }, { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN });

  observer.observe(terminal);
}
