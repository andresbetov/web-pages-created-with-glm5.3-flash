#!/usr/bin/env node
// Dev-only visual QA harness (devDependency: playwright-core + system Chromium). Never ships to Pages.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SHOT_URL ?? 'http://localhost:5173';
const OUT = '/tmp/opencode/qa-shots';
const EXE = '/usr/bin/chromium';
mkdirSync(OUT, { recursive: true });

// Sandboxed networks can stall the Google Fonts round-trip at capture time
// (blocking-font FOIT: settled layout above the fold, void below). Failed
// font loads also settle, so wait for `loaded` and capture either way.
function settleFonts(page, timeoutMs = 6000) {
  return page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: timeoutMs })
    .catch(() => console.log('… fonts unsettled on capture (blocked in sandbox); shot taken as-is'));
}

// Progressive scroll: let IO reveal everything (one-shot), then return to top.
// scroll-behavior:smooth animates the return leg for seconds — after that
// flight Chromium's compositor hasn't rasterized the passing area, so a
// viewport capture lands on a black void mid-glide. Force instant scroll for
// the loop, then wait until scrollY is actually back at 0.
async function warmup(page, pivot = 1) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const step = window.innerHeight * 0.8;
    const max = document.scrollingElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      document.scrollingElement.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 260));
    }
    document.scrollingElement.scrollTo(0, 0);
  });
  await page.waitForFunction(() => (document.scrollingElement.scrollTop || window.scrollY) === 0, { timeout: 3000 })
    .catch(() => console.log('… scroll did not settle to top; shot taken as-is'));
  await page.waitForTimeout(500 * pivot);
}

const browser = await chromium.launch({ executablePath: EXE, args: ['--disable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await settleFonts(page);
await page.waitForTimeout(1200);
await warmup(page, 1.5);

const overflowCheck = (p, name) => p.evaluate(() => ({ sw: document.scrollingElement.scrollWidth, iw: window.innerWidth }))
  .then(o => console.log(o.sw > o.iw + 1 ? `✗ OVERFLOW ${name}: ${o.sw}/${o.iw}` : `✓ no overflow ${name}`));

await page.screenshot({ path: `${OUT}/vp-1440.png` });
await overflowCheck(page, 'vp-1440');
await page.screenshot({ path: `${OUT}/full-1440.png`, fullPage: true });
await overflowCheck(page, 'full-1440');

// interactive states on the warmed 1440 session
await page.evaluate(() => document.querySelector('#demos')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/state-demos.png` });
const triggers = page.locator('[data-accordion-trigger]');
await triggers.nth(1).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/state-accordion-open.png` });
await page.evaluate(() => document.querySelector('.terminal')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(6000);
await page.screenshot({ path: `${OUT}/state-terminal.png` });
await page.evaluate(() => document.querySelector('.stats')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}/state-stats.png` });
await page.evaluate(() => document.querySelector('.bento')?.scrollIntoView());
await page.waitForTimeout(900);
const card = page.locator('[data-tilt]').first();
await card.hover({ position: { x: 40, y: 40 } });
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/state-tilt.png` });
// gallery mid-scrub
await page.evaluate(() => document.querySelector('.gallery')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/state-gallery.png` });
await ctx.close();

for (const s of [
  { name: 'full-768', w: 768, h: 1024 },
  { name: 'full-414', w: 414, h: 896 },
  { name: 'vp-360', w: 360, h: 800 },
  { name: 'vp-2560', w: 2560, h: 1200 },
]) {
  const c = await browser.newContext({ viewport: { width: s.w, height: s.h } });
  const p = await c.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await settleFonts(p);
  await p.waitForTimeout(900);
  await warmup(p);
  await p.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: false });
  if (s.name.startsWith('full')) {
    const vpName = `vp-${s.name.slice(5)}`; // top-of-viewport twin: fixed header at rest
    await p.screenshot({ path: `${OUT}/${vpName}.png`, fullPage: false });
    await p.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
  }
  await overflowCheck(p, s.name);
  await c.close();
}

// reduced-motion context: everything visible, no ambient loops
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const rp = await ctx2.newPage();
await rp.goto(BASE, { waitUntil: 'networkidle' });
await settleFonts(rp);
await rp.waitForTimeout(800);
await rp.screenshot({ path: `${OUT}/reduce-full-1440.png`, fullPage: true });
const st = await rp.evaluate(() => ({
  hidden: [...document.querySelectorAll('[data-reveal], [data-stagger] > *')].filter(el => getComputedStyle(el).opacity === '0').length,
  marqueeAnim: getComputedStyle(document.querySelector('[class*="marquee-track"]')).animationName,
}));
console.log(`✓ reduced-motion: hidden=${st.hidden} (must be 0) marquee=${st.marqueeAnim} (must be none)`);
await ctx2.close();

// motion-off toggle state
const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const tp = await ctx3.newPage();
await tp.goto(BASE, { waitUntil: 'networkidle' });
await settleFonts(tp);
await tp.waitForTimeout(600);
await tp.click('#motion-toggle');
await tp.waitForTimeout(400);
await tp.screenshot({ path: `${OUT}/motionoff-full-1440.png`, fullPage: true });
const st3 = await tp.evaluate(() => ({
  off: document.documentElement.classList.contains('motion-off'),
  pressed: document.querySelector('#motion-toggle')?.getAttribute('aria-pressed'),
  hidden: [...document.querySelectorAll('[data-reveal], [data-stagger] > *')].filter(el => getComputedStyle(el).opacity === '0').length,
}));
console.log(`✓ motion-off: class=${st3.off} aria-pressed=${st3.pressed} hidden=${st3.hidden} (want true/false/0)`);
await ctx3.close();

await browser.close();
console.log('DONE', OUT);
