# Design Doc — GLM Flash Showcase Landing Page

**Date:** 2026-10-16 · **Status:** Approved (user delegated full control)
**Repo:** andresbetov/web-pages-created-with-glm5.3-flash

## Intent & Why

This repository is a public gallery of premium web pages authored by an AI agent. The first entry is a **flagship single-page site** whose only purpose is to demonstrate senior-level frontend craft: visual design, animation, accessibility, and performance. Success = a visitor opens it and immediately says "an AI built *this*?"

## Goals

- Cinematic dark "aurora" landing page, zero framework dependencies (vanilla HTML/CSS/JS, zero npm runtime deps)
- Best-in-class visual design: display typography, glass cards, gradient/aurora art, grain, luminous accents
- Rich motion: scroll-driven reveals, parallax, magnetic buttons, cursor glow, marquee, kinetic type — all tastefully orchestrated
- Accessible: full prefers-reduced-motion support, keyboard navigable, WCAG 2.2 AA contrast, semantic landmarks
- Fast: no images (all-CSS/SVG art), font-display swap, 60fps animations (transform/opacity only), no layout shift
- Responsive: flawless from 360px to 4K
- Static, deployable to GitHub Pages, CI via GitHub Actions

## Non-goals

- No React/Vue/bundlers — showcase raw platform skill
- No dark/light theme toggle in v1 (dark-only is the art direction)
- No backend, no JS beyond ~400 lines

## Anti-goals (failure modes)

- Carousel-of-clichés: equal-width card rows, purple-gradient-on-purple, emoji bullets
- Motion overload: animations that compete with each other
- Anything that triggers horizontal scroll, CLS, or jank on mid-range mobile

## Visual direction (agent's call, locked)

- **Palette:** deep space navy `#0a0a12` base, luminous violet `#7c5cff` + cyan `#22d3ee` accents, warm amber `#fbbf24` highlight, off-white ink `#f4f4f8`. Contrast-verified for AA.
- **Typography:** Google Fonts — display: *Space Grotesk* (700/500), body: *Inter* (400/500), mono accents: *JetBrains Mono* (400). Kinetic hero type with staggered line reveals.
- **Texture:** film-grain noise overlay (inline SVG feTurbulence), radial aurora blobs with `filter: blur()` + `mix-blend-mode`, glass cards (`backdrop-filter`) used sparingly.
- **Layout:** editorial, asymmetric; bento grid for capability section; oversized display headlines (~clamp up to 7rem); generous whitespace rhythm on an 8px scale.

## Page structure (sections)

1. **Fixed header** — glass nav, logo mark, anchor links, scroll progress bar
2. **Hero** — staggered kinetic headline, sub-copy, dual CTA (magnetic), aurora backdrop, scroll cue
3. **Marquee** — infinite capability ticker (CSS animation, `aria-hidden` dup)
4. **Capabilities** — bento grid of 6 capability cards with hover micro-interactions (3D tilt, sheen sweep)
5. **Interactive demo strip** — live mini-demos: typing terminal, color palette morph, accordion process timeline
6. **Stats** — count-up numbers on scroll (IntersectionObserver)
7. **Featured work / gallery** — 3 tall CSS-art cards, parallax hover
8. **Manifesto / editorial CTA band** — big statement, gradient text
9. **Footer** — structured columns, mono accents, back-to-top

## Constraints

- Single deliverable folder `showcase/` (`index.html`, `css/*.css`, `js/*.js`, inline SVG art)
- Modern CSS allowed: `:has()`, container queries, `scroll-timeline` with IO fallback, `clamp()`, `color-mix()`
- JS as ES modules, IIFE-guarded, events passive, IO-driven — no libraries
- Fonts preconnect + optional manual preload, `font-display: swap`

## Open items delegated to builder (mine to settle)

Exact copywriting, exact easing values, breakpoint values, file split within `css/` and `js/`.

## Git workflow (per user request)

GitHub Flow: `main` deployable; feature branches + PRs (+ reviews by subagents) merged after fixes; conventional commits; tag `v1.0.0` at ship.
