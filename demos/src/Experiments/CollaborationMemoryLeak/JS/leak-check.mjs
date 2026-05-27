// Headless verification harness for the collaboration memory-leak experiment.
// Run from the repo root (so @playwright/test resolves) with the demo dev server up:
//   pnpm dev   # in another shell
//   node demos/src/Experiments/CollaborationMemoryLeak/JS/leak-check.mjs
// Uses the system Chrome with --expose-gc so window.gc() actually collects.
import { chromium } from '@playwright/test'

const URL = 'http://localhost:3000/src/Experiments/CollaborationMemoryLeak/JS/'

const run = async (opts = {}) => {
  const { fixA, fixB, caret, nocollab } = opts
  const browser = await chromium.launch({ channel: 'chrome', args: ['--js-flags=--expose-gc'] })
  const page = await browser.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('pageerror: ' + e.message))

  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('#run')

  if (fixA) await page.check('#fixA')
  if (fixB) await page.check('#fixB')
  if (caret) await page.check('#caret')
  if (nocollab) await page.check('#nocollab')
  await page.fill('#count', '20')

  await page.click('#run')
  await page.waitForTimeout(300)
  for (let i = 0; i < 4; i++) {
    await page.click('#gc')
    await page.waitForTimeout(300)
  }

  const stats = await page.evaluate(() => ({
    created: document.getElementById('created').textContent,
    collected: document.getElementById('collected').textContent,
    alive: document.getElementById('alive').textContent,
    docListeners: document.getElementById('docListeners').textContent,
  }))

  await browser.close()
  // ignore the unrelated favicon/iframe-resizer 404 noise
  const realErrors = errors.filter(e => !/404|Not Found/.test(e))
  return { stats, errors: realErrors }
}

const fmt = r =>
  `created=${r.stats.created} collected=${r.stats.collected} alive=${r.stats.alive} docListeners=${r.stats.docListeners}` +
  (r.errors.length ? ` ERRORS=${JSON.stringify(r.errors)}` : '')

console.log('CONTROL (no collaboration)   :', fmt(await run({ nocollab: true })))
console.log('collab, no fix               :', fmt(await run({})))
console.log('collab, fix A only           :', fmt(await run({ fixA: true })))
console.log('collab, fix B only           :', fmt(await run({ fixB: true })))
console.log('collab, fix A + B            :', fmt(await run({ fixA: true, fixB: true })))
console.log('collab+caret, no fix         :', fmt(await run({ caret: true })))
console.log('collab+caret, fix A + B      :', fmt(await run({ caret: true, fixA: true, fixB: true })))
