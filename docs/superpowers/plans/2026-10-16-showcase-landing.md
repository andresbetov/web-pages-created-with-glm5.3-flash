# Showcase Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `showcase/index.html` — a cinematic, dark "aurora" single-page site that demonstrates senior frontend craft, zero dependencies, GitHub Pages ready.

**Architecture:** Static vanilla site: one HTML file, 5 focused CSS files (tokens → layout → components → sections → motion), 5 small ES-module JS files (reveal, effects, terminal, accordion, main). All art is CSS/SVG (no images). Motion is transform/opacity-only with IntersectionObserver and optional CSS scroll-timeline, fully disabled under `prefers-reduced-motion`.

**Tech Stack:** HTML5, modern CSS (`:has()`, container queries, `clamp()`, `color-mix()`, `backdrop-filter`), vanilla ES2022 JS, Google Fonts (Space Grotesk, Inter, JetBrains Mono), Chromium headless screenshots for visual verification.

**Spec:** `docs/superpowers/specs/2026-10-16-showcase-landing-design.md`

## Global Constraints

- Zero runtime dependencies; `package.json` may only contain `devDependencies` for QA tooling and a `dev`/`screenshot` script.
- Only these font families load: Space Grotesk 500/700, Inter 400/500, JetBrains Mono 400/500 (single `<link>` with `preconnect`, `display=swap`).
- Palette tokens (exact): `--bg:#0a0a12` `--ink:#f4f4f8` `--ink-dim:color-mix(in oklab, var(--ink) 64%, transparent)` `--accent:#7c5cff` `--accent-2:#22d3ee` `--gold:#fbbf24` `--surface:#131320` `--line:color-mix(in oklab, var(--ink) 12%, transparent)`.
- Spacing rhythm: 8px scale (`.05rem` mono kicker tracking is allowed).
- Animate **only** `transform` and `opacity` (plus `filter: blur` on decorative prefilled aurora blobs). Never animate `width/height/top/left/margin` — creates jank.
- Every `@keyframes` and scroll effect MUST have a `prefers-reduced-motion: reduce` neutralizer (elements must remain fully visible — never locked at `opacity:0`); duplicate the same neutralizer block for the `html.motion-off` alias (in-page motion toggle).
- JS hooks (exact, pinned contract): `[data-reveal]` (fade-up on intersect), `[data-reveal~="left"|"right"|"zoom"]` variants, `[data-stagger]` parent (children get incremental delay = `i * 90ms`), `[data-tilt]` (3D tilt ≤8°), `[data-magnetic]` (pull = 35% of cursor offset within box, ≤12px cap, release 450ms `cubic-bezier(0.23,1,0.32,1)`, enabled only when `(pointer: fine)` and not reduced-motion), `[data-count="N"]` (count-up 1.2s ease-out on intersect), `#scroll-progress` (top bar width = scroll %), `.terminal` with `[data-terminal-output]` and `[data-terminal-idle]`, `[data-accordion]` group with `[data-accordion-trigger]` buttons, `#motion-toggle` header button (`aria-pressed`) that adds/removes `motion-off` on `<html>` (localStorage-persisted) — the CSS alias of the reduced-motion neutralizers.
- IDs (exact): `#main` (section landmark target for skip link), `#scroll-progress`.
- BEM-lite class prefix per component: `.site-header`, `.hero`, `.marquee`, `.bento`, `.demos`, `.stats`, `.gallery`, `.manifesto`, `.footer`.
- Content language: English; no lorem ipsum; copy from Task 1 verbatim where pinned.

## Review Focus

1. **Horizontal overflow on narrow screens:** at 360px width no element may cause horizontal scroll — pinned by Task 6 overflow assertion (`document.scrollingElement.scrollWidth <= innerWidth`).
2. **Reduced-motion users:** with `prefers-reduced-motion: reduce` every element is visible in the DOM/screenshots (nothing stuck at `opacity:0`), marquees don't auto-scroll — pinned by Task 6 reduced-motion screenshot suite.
3. **Constrained-width / zoom-to-200-faux:** headline wire at 768px must not overlap the hero CTA stack — covered by Task 7 tablet screenshot review.
4. **Keyboard-only users:** skip link first, all triggers focusable, `:focus-visible` rings on dark bg — covered by Task 6 focus courier check (`:focus-visible` in CSS + `tabindex` audit grep) and Task 7 manual curation.
5. **Font-loading fail-safe:** `display=swap` verified in HTML (Task 1 grep) so text never renders invisible during font fetch.

---

### Task 1: Skeleton, tokens & pinned copy (contract task — others depend on it)

**Files:**
- Create: `showcase/index.html`
- Create: `showcase/css/base.css`
- Create: `package.json`

**Interfaces (produced):** the exact section skeleton + IDs/data-attributes from Global Constraints; CSS custom-property token names above; `<body>` gets `class="is-booting"`.

**Steps:**

- [ ] **Step 1: Write semantic HTML skeleton** — `<header>` (skip link → `#main`, inline-SVG logo, 3 anchor links, `#motion-toggle` button labelled `Motion`, `#scroll-progress` child of header), `<main id="main">` with 8 `<section>`s in order: `.hero` (kicker `GLM 5.3 FLASH × OPENCODE`, 3 stacked display lines `DESIGN` / `ENGINEERED` / `BY INTELLIGENCE.`, sub-copy exactly: *"A showcase of what GLM 5.3 Flash builds in a single session — cinematic motion, editorial type, zero dependencies. Every pixel on this page was written by a machine with taste."*, CTAs `[data-magnetic]`: **See the work** and **How it's built**), `.marquee` (8 items: KINETIC TYPE / AURORA MESH / SCROLL CHOREOGRAPHY / MAGNETIC UI / BENTO GRIDS / GLASS MORPHISM / GRAIN OVERLAYS / ZERO DEPENDENCIES — one `aria-hidden` duplicated track), `.bento` (kicker `01 / CAPABILITIES`, h2 `Built like a studio, in one pass.`, 6 cards: Typography Engine, Motion Systems, Aurora Rendering, Micro-interactions, Adaptive Layouts, Dependency Zero — each with mono index `A—F`, title, 1-sentence body), `.demos` (kicker `02 / INTERACTIVE`, h2 `Proof, not promises.`, 3 demo panels: `.terminal` with `[data-terminal-output]`/`[data-terminal-idle]`, palette morph panel `.morph`, `.manifesto-accordion` with 4 `[data-accordion-trigger]` steps: Research → Design → Implement → Verify), `.stats` (kicker `03 / RUNTIME NUMBERS`, 4 items `data-count`: `0` npm dependencies, `60` fps animations, `100` lighthouse target, `1` session), `.gallery` (kicker `04 / SELECTED FRAMES`, h2 `Machines can shoot film now.`, 3 tall cards: NEBULA / CASCADE / MONOLITH), `.manifesto` (big line: *"The prompt was one sentence. The rest is taste."*, secondary CTA `How it's built` → `#demos`), `<footer class="footer">` (3 columns: Explore/Stack/Meta + legal line `Built by GLM 5.3 Flash · OpenCode orchestration · Space Grotesk × Inter × JetBrains Mono`); primary CTA must appear ≥3× across page (hero pair, manifesto, footer "See the work" link).
  - Fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">` + `fonts.gstatic.com` crossorigin + family link WITH `&display=swap`.
  - `<html lang="en">`, meta description, `<meta name="theme-color" content="#0a0a12">`, title `GLM Flash — AI-crafted web experiences`.
  - Decorative layer resolved by CSS only: 3 parent `<div class="aurora" aria-hidden="true">` blobs inside body start (not per-section).
- [ ] **Step 2: Write base.css** — modern reset (box-sizing, margin 0, `img{max-width:100%}`), `:root` tokens from Global Constraints, `html{scroll-behavior:smooth}` + `@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}`, body typography (Inter 16px/1.6, `-webkit-font-smoothing`), display-font utility `.font-display` (Space Grotesk, `letter-spacing:-0.02em`), `.kicker` (JetBrains Mono 0.75rem uppercase, letter-spacing 0.35em, color `--accent-2`), `.aurora` blob base (fixed, `will-change: transform`, three color mixes violet/cyan/gold, `filter: blur(90px)`, `opacity:.5`), `.grain` overlay (fixed full, inline-SVG feTurbulence `baseFrequency="0.8"` as `background-image` data-URI, `opacity:.05`, `pointer-events:none`), `:focus-visible` ring (`outline:2px solid var(--accent-2); outline-offset:4px`), skip-link styles, selection color.
- [ ] **Step 3: package.json** — `{"name":"web-pages-created-with-glm5.3-flash","private":true,"type":"module","scripts":{"dev":"npx --yes serve showcase -l 5173"},"devDependencies":{"playwright-core":"^1.49.0"}}`.
- [ ] **Step 4: Verify structure** — run `node -e "const s=require('fs').readFileSync('showcase/index.html','utf8'); for (const id of ['main','scroll-progress']) console.assert(s.includes('id=\"'+id+'\"'), id); for (const c of ['hero','marquee','bento','demos','stats','gallery','manifesto','footer']) console.assert(s.includes('class=\"'+c)||s.includes(c), c); console.log('skeleton OK'); for (const hook of ['data-reveal','data-stagger','data-count','data-magnetic','data-tilt','data-terminal','data-accordion']) console.assert(s.includes(hook), hook); console.log('hooks OK', s.includes('display=swap')?'; font swap OK':'')"`.
  Run from repo root. Expected: `skeleton OK`, `hooks OK ; font swap OK`, main id, progress id, all 8 classes — and NO stderr assertion noise.
- [ ] **Step 5: Screenshot smoke** — `npx --yes serve showcase -l 5173` backgrounded; then `/usr/bin/chromium --headless=new --disable-gpu --screenshot=/tmp/opencode/hero-360.png --window-size=360,800 --hide-scrollbars http://localhost:5173` (and repeat 1440,900). View both via `read`; make sure no layout explosion (JS not yet present is fine — blank second sections acceptable at this stage; hero text visible is a MUST).
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat(showcase): semantic skeleton, design tokens, pinned copy"`.

### Task 2: Layout, components & full section styling (owns `css/layout.css`, `css/components.css`, `css/sections.css`, edits `index.html` classes only)

**Files:**
- Create: `showcase/css/layout.css`, `showcase/css/components.css`, `showcase/css/sections.css`
- Modify: `showcase/index.html` (add structural/inner classes & inline SVG logo; no copy changes)

**Interfaces:**
- Consumes: Task 1 tokens (`--bg`, `--ink`, `--accent`, `--accent-2`, `--gold`, `--surface`, `--line`, `--ink-dim`), classes `.font-display`, `.kicker`, section classes, all JS hooks (styled, not required to run).
- Produces: hover/focus states for `.btn` (`.btn-solid` `.btn-ghost` variants), `.card` glass treatment used by JS tilt (`transform-style:preserve-3d` where relevant), `.gallery-card` art using `conic-gradient`/`radial-gradient` layers ONLY (no external assets).

**Steps:**

- [ ] **Step 1: layout.css** — `.container{max-width:72rem; margin-inline:auto; padding-inline:clamp(1.25rem,3vw,3rem)}`, section vertical rhythm `padding-block: clamp(5rem, 10vw, 9rem)`, below-fold sections get `content-visibility:auto` + `contain-intrinsic-size: auto 720px` (CLS-safe, only below-fold), responsive header (glass on scroll: `position:fixed`, `backdrop-filter: blur(12px) saturate(1.4)`, border-bottom `--line`), footer grid (`grid-template-columns: repeat(3, 1fr)` → 1fr at ≤640px), `.stats` grid 4→2→1.
- [ ] **Step 2: components.css** — `.btn` (paging-pill, Space Grotesk 500, `.btn-solid` = accent→accent-2 gradient text-dark `#0a0a12`, hover: `translateY(-2px)` + shadow `0 8px 30px color-mix(in oklab, var(--accent) 45%, transparent)`, transition `transform .25s cubic-bezier(.22,1,.36,1)`, `:active{scale:.96}`, interactive targets ≥24×24px; `.btn-ghost` = 1px `--line` border, hover border accent), `.card` (glass: `background:color-mix(in oklab, var(--surface) 55%, transparent)`, 1px `--line` border, radius 1.25rem, `backdrop-filter: blur(10px)`, hover: border-color `color-mix(in oklab, var(--accent) 55%, var(--line))` + sheen `::after` sweep ONLY on `:hover` using a translated gradient), progress bar base, marquee track base (will be animated in motion.css).
- [ ] **Step 3: sections.css** — hero: min-height `100svh`, centered column, display lines `font-size: clamp(3rem, 12vw, 7.5rem)` uppercase `line-height:.95`, middle line gradient-clipped text (`.grad-text{background:linear-gradient(92deg,var(--accent),var(--accent-2) 70%); -webkit-background-clip:text; color:transparent}`), sub-copy max-width `36rem` `--ink-dim`, scroll cue at bottom (mono, bouncing chevron via padding-box border trick omitted → CSS borders only); marquee: full-bleed flex track, gap `2.5rem`, mono uppercase items with `aria-hidden` track; bento: CSS grid `grid-template-columns:repeat(3,1fr)` spanning pattern (card A spans 2 cols; card F spans 1 col × 2 rows), each card distinct art (Typography card: giant `“Aa”` watermark glyph; Motion card: three staggered outlined chips; Aurora card: mini aurora gradient; Micro card: circular mouse-dot; Adaptive card: 3 nested widths bars; Zero card: mono `0` glyph) — ALL pure CSS; demos: 3 panels grid, terminal dark inset `#05050a` with traffic dots (CSS circles), mono `#22d3ee` text; stats: giant numbers `clamp(3rem,6vw,5rem)` Space Grotesk with `--gold` highlight; gallery: 3 tall `aspect-ratio: 3/4` cards with layered `conic-gradient`+`radial-gradient` art and title chips (NEBULA violet/cyan, CASCADE vertical repeating-gradient falls, MONOLITH dark concentric boxes); manifesto: full-bleed band `background: linear-gradient(180deg, transparent, color-mix(in oklab, var(--accent) 9%, transparent))` + huge quote + gradient rule line.
- [ ] **Step 4: Responsive & contrast** — bento→1col ≤900px (span rules reset), hero CTAs stack ≤480px, verify all body text ≥ `--ink-dim` (64% on `#0a0a12` = ≥4.6:1 for 16px). Mono kickers at 75% opacity minimum.
- [ ] **Step 5: Visual check** — serve + screenshot 360×800, 768×1024, 1440×900 (full page tall shots: `--window-size=1440,5600`). Read each image. Checklist: no overlap, no clipped type, hero dominates, sections breathe. Fix anything failing before commit.
- [ ] **Step 6: Overflow check** — `node -e "..."` snippet replaced by: chromium `--headless=new --dump-dom` not needed; run BrowserOverflow snippet in Task 7. Here: grep for `overflow-x` fixes only where needed (`body{overflow-x:clip}` allowed as final guard) and commit.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat(showcase): full section styling, bento art, glass components"`.

### Task 3: Motion system (owns `css/motion.css` — file-disjoint, parallel with Task 2 after Task 1)

**Files:**
- Create: `showcase/css/motion.css`
- Modify: `showcase/index.html` ONLY to `<link>` motion.css last stylesheet order and add `hidden` no-js guard class `data-no-motion-guard` (single line edit).

**Interfaces:**
- Consumes: `.marquee` track, `.aurora` blobs, `[data-reveal]`, `[data-stagger]`, bento cards, gallery cards.
- Produces: `@supports (animation-timeline: view())` scroll-driven variants; `[data-reveal]` pre-states (`.js [data-reveal]{opacity:0; translate:0 24px}`), `.is-revealed` toggles; `.hero-line` cascade via `animation-delay: calc(var(--i) * 120ms)`; marquee keyframes `translateX(0→-50%) 28s linear infinite` on the SECOND (`aria-hidden`) track direction; aurora drift keyframes (60s alternate scales/translations, `prefilled` blur); scroll-progress uses `scroll-timeline` where supported, px-width fallback in JS Task 4; tilt sheen coordination not needed.

**Steps:**

- [ ] **Step 1: Reveal cascade** — `.js [data-reveal]` hidden pre-state; `.js .is-revealed` → `opacity:1; translate:0 0; transition: opacity .7s ease-out, translate .7s cubic-bezier(.22,1,.36,1)`; `[data-stagger] > *` delays `calc(var(--i) * 90ms)`; hero lines tick up with slight `rotateZ(.5deg→0)`.
- [ ] **Step 2: Ambient motion** — marquee, aurora-drift, scroll-cue bounce (`translateY 6px` 2s ease-in-out infinite), CTA sheen only on hover.
- [ ] **Step 3: Scroll-driven bonus** — `@supports (animation-timeline: view())`: gallery cards scrub `rotateX(6deg→0)` with `animation-range: entry 0% entry 65%` + title transparence on entering view; browsers without support get none of it (no JS dependency).
- [ ] **Step 4: Reduced-motion block** — one `@media (prefers-reduced-motion: reduce)` that sets all ambient animations to `animation: none`, `[data-reveal]` pre-states to visible (opacity:1, translate:0), marquee track to `animation:none` with `translate:0` (single visible track is HTML default so fine), hero-line all at final state. Elements must NEVER rest at `opacity:0` in this mode.
- [ ] **Step 5: Verify** — screenshot with 1440×900; ensure hero text visible WITHOUT JS (guard: only `.js [data-reveal]` hidden — verify exactly this selector by grep "only .js [data-reveal] has opacity:0 pre-state"). Commit `feat(showcase): motion system with reduced-motion parity`.

### Task 4: Interactions (owns `js/` — file-disjoint, parallel with Tasks 2–3)

**Files:**
- Create: `showcase/js/reveal.js`, `showcase/js/effects.js`, `showcase/js/terminal.js`, `showcase/js/accordion.js`, `showcase/js/main.js`

**Interfaces:**
- Consumes: pinned JS hooks from Global Constraints; `.is-revealed`, `#scroll-progress`, styles from Tasks 2–3.
- Produces: single entry `main.js` (no exports needed by others); all queries null-safe; exposes nothing global except `document.documentElement.classList.add('js')` FIRST LINES of main.js.

**Steps:**

- [ ] **Step 1: reveal.js** — `IntersectionObserver({threshold:.15, rootMargin:'0px 0px -10% 0px'})`: on intersect add `.is-revealed`, unobserve (one-shot). Stagger parents: for `[data-stagger]` set each child `style.setProperty('--i', idx)`. Counters: `[data-count]` animate textContent from 0→N with `requestAnimationFrame` 1.2s `easeOutCubic` (`1 - Math.pow(1-t,3)`), formats plain integers; respects `prefers-reduced-motion` (jump instantly to N).
- [ ] **Step 2: effects.js** — scroll progress: `scroll` (passive) listener sets `width` of `#scroll-progress` to `scrollY/(scrollHeight-innerHeight)*100%`; CSS scroll-timeline path (if motion.css defined it) wins automatically — JS width only the fallback; magnetic: on `mousemove` over `[data-magnetic]` translate = 0.35× cursor-offset (capped 12px), release 450ms `cubic-bezier(0.23,1,0.32,1)`, enabled only when `(pointer: fine)` matches; tilt: per `[data-tilt]`, ≤8° `perspective(800px) rotateX/rotateY` + `--mx/--my` custom props for sheen, reset on leave; all wrapped in a change-listener for `(prefers-reduced-motion: reduce)` AND deferred when `html.motion-off` — every effect inert in both cases.
- [ ] **Step 3: terminal.js** — `[data-terminal-output]`: type 6 lines (mono, cyan): `$ opencode run showcase`, `→ composing design tokens … ok`, `→ animating 9 sections … ok`, `→ auditing contrast … AA passed`, `→ zero dependencies attached`, `▍ done in 1 session.` cursor `▍` blink via CSS class `.is-typing` toggling; start only when `.terminal` intersects; respect reduced-motion (print all lines instantly).
- [ ] **Step 4: accordion.js + motion-toggle** — `[data-accordion-trigger]`: toggle `aria-expanded` on trigger + `hidden` attribute on panel (details/summary NOT used), one open at a time; Enter/Space native button behavior; panels styled separately is Task 2's accordion panel class `.demos .panel`. Also `#motion-toggle`: flip `aria-pressed`, persist boolean in `localStorage("motion")`, add/remove `motion-off` class on `<html>` (script inlined in HTML head is FORBIDDEN — this lives in effects.js for single-entry orchestration; flashes acceptable only until JS runs).
- [ ] **Step 5: main.js** — first line: `document.documentElement.classList.add('js')`; then single import-once orchestration; `node --check showcase/js/main.js` passes for all 5 files (run for each).
- [ ] **Step 6: Verify** — serve; headless chromium `--run-all-compositor-stages-before-draw --virtual-time-budget=4000 --dump-dom http://localhost:5173` grep: contains `class="js` and `is-revealed` present (JS ran in headless mode with network-stack fonts ok). Commit `feat(showcase): interactions — reveal, tilt, magnetic, terminal, accordion, counters`.

### Task 5: CI & deploy (tiny, parallel anytime after Task 1)

**Files:** Create `.github/workflows/deploy.yml`; Modify `README.md` (one-line demo link placeholder commit-safe).

**Steps:**
- [ ] Workflow: on push `main` → upload `showcase/` artifact → deploy GitHub Pages action. Lint-lite step: `node -e "…"` structural checks from Task 1.
- [ ] Commit `ci: deploy showcase to GitHub Pages on main push`.

### Task 6: Visual QA wave (orchestrator + design-QA/critique subagents, screenshots at 360/768/1440/2560)

- [ ] Playwright-core script `tools/screenshot.mjs` using system Chromium executablePath, capturing full-page shots + scrollWidth overflow assertion + `[data-reveal]` visible-under-reduced-motion assertion.
- [ ] I (orchestrator) read every screenshot; parallel subagents: (a) a11y auditor, (b) performance/critic reading screenshots + code. Any fix → new fix branch → re-screenshot → repeat until zero warnings.

### Task 7: Final review & ship

- [ ] `superpowers:requesting-code-review` full-branch review; fix anything flagged; merge PR(s); tag `v1.0.0`; push.
