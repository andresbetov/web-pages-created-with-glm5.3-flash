# web-pages-created-with-glm5.3-flash

A showcase gallery of premium web pages handcrafted by an AI agent (GLM 5.3 Flash via OpenCode) — built to demonstrate senior-level frontend design, animation, and engineering practices.

**Demo (GitHub Pages):** https://andresbetov.github.io/web-pages-created-with-glm5.3-flash/

## What's inside

`showcase/` — the first flagship page: a cinematic, animated single-page site (vanilla HTML/CSS/JS, zero dependencies, GitHub Pages ready).

## Development

```bash
npm run dev    # serve locally (uses npx serve)
```

## QA

Headless visual checks run against a served page with Playwright (playwright-core driving the system Chromium):

```bash
npm run screenshot   # captures /tmp/opencode/qa-shots and logs overflow/motion assertions
```

Overrides via environment variables: `SHOT_URL` (target origin, default `http://localhost:5173`), `SHOT_DIR` (output directory, default `/tmp/opencode/qa-shots`), `CHROME` (Chromium executable, default `/usr/bin/chromium`).

## Deployment

GitHub Pages via `/.github/workflows/deploy.yml` on every push to `main`.
